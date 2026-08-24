import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const BUCKET = 'test-catalog-lyrics';
const catalogPath = path.join(ROOT, 'supabase', 'seed', 'stitch_test_catalog.json');
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedUserId = process.env.SEED_USER_ID;

if (!supabaseUrl || !serviceRoleKey || !seedUserId) {
  console.error('Required environment: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, and SEED_USER_ID.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const slugify = (value, fallback) => {
  const slug = value.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || fallback;
};

const deterministicUuid = (key) => {
  const bytes = crypto.createHash('sha256').update(`star-lyrix-test:${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const { data: seedUser, error: seedUserError } = await supabase.from('users').select('id').eq('id', seedUserId).maybeSingle();
if (seedUserError) throw seedUserError;
if (!seedUser) throw new Error(`SEED_USER_ID ${seedUserId} does not exist in public.users. Sign in once and use that profile id.`);

let completed = 0;
for (const [index, item] of catalog.entries()) {
  const songId = deterministicUuid(`${item.language}:${index + 1}:${item.title}`);
  const releaseDate = `2025-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`;
  const slug = `${String(index + 1).padStart(2, '0')}-${slugify(item.title, `track-${index + 1}`)}`;
  const storagePath = `${item.language}/${slug}.txt`;

  const { error: songError } = await supabase.from('songs').upsert({
    id: songId,
    title: item.title,
    artist: item.artist,
    album: item.album,
    language: item.language,
    language_code: item.language,
    lyrics_status: 'verified',
    rights_status: 'owned',
    rights_holder: 'Star Lyrix QA catalog',
    license_reference: 'internal:star-lyrix-qa-catalog',
    verified: true,
    release_date: releaseDate,
    thumbnail_url: null,
    created_by: seedUserId,
  }, { onConflict: 'title,artist' });
  if (songError) throw songError;

  const { error: lyricsError } = await supabase.from('lyrics').upsert({
    id: deterministicUuid(`lyrics:${songId}`),
    song_id: songId,
    content: item.lyrics,
    language_code: item.language,
    source_type: 'star_lyrix_original',
    rights_status: 'owned',
    rights_holder: 'Star Lyrix QA catalog',
    license_reference: 'internal:star-lyrix-qa-catalog',
    allowed_display: true,
    allowed_translation: true,
    allowed_synchronization: false,
    status: 'verified',
    verified: true,
    created_by: seedUserId,
  }, { onConflict: 'song_id' });
  if (lyricsError) throw lyricsError;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, Buffer.from(`${item.title}\n${item.artist}\n\n${item.lyrics}\n`, 'utf8'), {
    contentType: 'text/plain; charset=utf-8',
    cacheControl: '3600',
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { error: assetError } = await supabase.from('test_catalog_assets').upsert({
    song_id: songId,
    language: item.language,
    bucket_id: BUCKET,
    storage_path: storagePath,
    content_type: 'text/plain; charset=utf-8',
    created_by: seedUserId,
  }, { onConflict: 'song_id' });
  if (assetError) throw assetError;

  completed += 1;
  console.log(`[${completed}/${catalog.length}] ${item.language.toUpperCase()} — ${item.title}`);
}

console.log(`Seeded ${completed} original test songs, lyrics records, and Storage assets into ${BUCKET}.`);
