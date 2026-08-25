import React from 'react';
import { ArrowRight, CheckCircle2, FileCheck2, Film, Info, Loader2, ShieldCheck, Upload, Youtube } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  createArtistProfile,
  createArtistSubmission,
  finalizeArtistSubmission,
  listArtistProfiles,
  listArtistSubmissions,
  submissionStatusLabel,
  type ArtistProfile,
  type ArtistVideoSubmission,
} from '../lib/artistSubmissions';
import { LANGUAGE_OPTIONS } from '../lib/discovery';

const VIDEO_URL_PATTERN = /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i;
const HTTPS_URL_PATTERN = /^https:\/\//i;

const ArtistSubmission = () => {
  const { user } = useAuthStore();
  const [profiles, setProfiles] = React.useState<ArtistProfile[]>([]);
  const [submissions, setSubmissions] = React.useState<ArtistVideoSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [form, setForm] = React.useState({
    artistName: '',
    profileBio: '',
    songTitle: '',
    albumTitle: '',
    videoTitle: '',
    description: '',
    languageCode: 'en',
    genre: '',
    releaseDate: '',
    videoSourceType: 'youtube_unlisted',
    videoSourceUrl: '',
    thumbnailUrl: '',
    rightsHolder: '',
    rightsEvidenceUrl: '',
    lyricsRightsStatus: 'not_submitted',
    lyricsLicenseReference: '',
  });
  const [rightsAttested, setRightsAttested] = React.useState(false);
  const [permissionToEdit, setPermissionToEdit] = React.useState(false);
  const [permissionToPublish, setPermissionToPublish] = React.useState(false);

  const loadPortal = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [profileRows, submissionRows] = await Promise.all([
        listArtistProfiles(user.id),
        listArtistSubmissions(user.id),
      ]);
      setProfiles(profileRows);
      setSubmissions(submissionRows);
      if (profileRows[0]) {
        setForm((previous) => ({ ...previous, artistName: previous.artistName || profileRows[0].display_name, profileBio: previous.profileBio || profileRows[0].biography || '' }));
      } else {
        setForm((previous) => ({ ...previous, artistName: previous.artistName || user.user_metadata?.display_name || user.email?.split('@')[0] || '' }));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The submission portal is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { void loadPortal(); }, [loadPortal]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const validate = () => {
    if (!form.artistName.trim() || !form.songTitle.trim() || !form.videoTitle.trim()) return 'Artist name, song title, and video title are required.';
    if (!form.videoSourceUrl.trim() || !HTTPS_URL_PATTERN.test(form.videoSourceUrl.trim())) return 'Add an HTTPS video URL that Star Lyrix can review.';
    if (form.videoSourceType !== 'hosted_upload' && !VIDEO_URL_PATTERN.test(form.videoSourceUrl.trim())) return 'For YouTube submissions, use an HTTPS YouTube or youtu.be URL.';
    if (form.thumbnailUrl && !HTTPS_URL_PATTERN.test(form.thumbnailUrl.trim())) return 'Thumbnail URL must use HTTPS.';
    if (form.rightsEvidenceUrl && !HTTPS_URL_PATTERN.test(form.rightsEvidenceUrl.trim())) return 'Rights evidence URL must use HTTPS.';
    if (!form.rightsHolder.trim()) return 'Name the copyright or publishing rights holder.';
    if (!rightsAttested || !permissionToEdit || !permissionToPublish) return 'Confirm rights ownership, editing permission, and publishing permission before submitting.';
    if (form.lyricsRightsStatus === 'licensed' && !form.lyricsLicenseReference.trim()) return 'Add a license reference when lyrics are marked licensed.';
    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!user) {
      setError('Sign in to submit a video.');
      return;
    }

    setSaving(true);
    try {
      let profile = profiles[0];
      if (!profile) {
        profile = await createArtistProfile({ owner_id: user.id, display_name: form.artistName.trim(), biography: form.profileBio.trim() || null, is_public: false, verified: false });
        setProfiles([profile]);
      }

      const draft = await createArtistSubmission({
        artist_profile_id: profile.id,
        created_by: user.id,
        artist_name: form.artistName.trim(),
        song_title: form.songTitle.trim(),
        album_title: form.albumTitle.trim() || null,
        video_title: form.videoTitle.trim(),
        description: form.description.trim() || null,
        language_code: form.languageCode,
        genre: form.genre.trim() || null,
        release_date: form.releaseDate || null,
        video_source_type: form.videoSourceType,
        video_source_url: form.videoSourceUrl.trim(),
        thumbnail_url: form.thumbnailUrl.trim() || null,
        rights_holder: form.rightsHolder.trim(),
        rights_evidence_url: form.rightsEvidenceUrl.trim() || null,
        lyrics_rights_status: form.lyricsRightsStatus,
        lyrics_license_reference: form.lyricsLicenseReference.trim() || null,
        rights_attested: false,
        permission_to_edit: false,
        permission_to_publish: false,
        status: 'draft',
      });
      const submitted = await finalizeArtistSubmission(draft.id);
      setSubmissions((previous) => [submitted, ...previous]);
      setSuccess('Submission received. It is now waiting for rights verification and content review.');
      setForm((previous) => ({ ...previous, songTitle: '', albumTitle: '', videoTitle: '', description: '', releaseDate: '', videoSourceUrl: '', thumbnailUrl: '', rightsEvidenceUrl: '', lyricsLicenseReference: '' }));
      setRightsAttested(false);
      setPermissionToEdit(false);
      setPermissionToPublish(false);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'The submission could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="artist-submission-page mx-auto max-w-6xl">
      <header className="artist-submission-hero">
        <div><p className="eyebrow">Artist Submission Portal</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.06em] text-[var(--text-primary)] sm:text-6xl">Put your story<br /><span>in the right room.</span></h1><p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">Submit a lyric video or visual story for consideration on the Star Lyrix channel. Every submission is reviewed for rights, content, and quality before it can enter a publishing queue.</p></div>
        <div className="artist-submission-stage"><div className="artist-submission-stage-orbit" aria-hidden="true" /><Film className="h-8 w-8 text-[var(--gold-light)]" aria-hidden="true" /><span>SUBMIT / REVIEW / SHARE</span></div>
      </header>

      <div className="artist-submission-layout">
        <form onSubmit={handleSubmit} className="surface-card space-y-7 p-6 sm:p-8">
          <div className="flex items-start gap-3 border-b border-[var(--border-subtle)] pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(212,168,67,0.14)] text-[var(--gold-light)]"><Upload className="h-5 w-5" aria-hidden="true" /></div><div><p className="eyebrow">01 / Your release</p><h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">Tell us what you made.</h2><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Start with the identity of the artist, song, and visual.</p></div></div>
          <div className="grid gap-5 sm:grid-cols-2"><Field id="artistName" label="Artist / creator name *" value={form.artistName} onChange={updateField} required /><Field id="songTitle" label="Song title *" value={form.songTitle} onChange={updateField} required /><Field id="albumTitle" label="Album or release" value={form.albumTitle} onChange={updateField} /><Field id="videoTitle" label="Video title *" value={form.videoTitle} onChange={updateField} required /><Field id="genre" label="Genre" value={form.genre} onChange={updateField} placeholder="Pop, indie, hip-hop…" /><Field id="releaseDate" label="Release date" type="date" value={form.releaseDate} onChange={updateField} /><label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Primary language *</span><select id="languageCode" name="languageCode" value={form.languageCode} onChange={updateField} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)]" required>{LANGUAGE_OPTIONS.filter((option) => option.code !== 'all').map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label></div>
          <label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Artist bio</span><textarea id="profileBio" name="profileBio" value={form.profileBio} onChange={updateField} rows={3} placeholder="A short introduction for a future artist profile…" className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" /></label>
          <label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Video description</span><textarea id="description" name="description" value={form.description} onChange={updateField} rows={4} placeholder="What should a viewer feel, notice, or understand?" className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" /></label>

          <div className="rounded-2xl border border-[rgba(212,168,67,0.25)] bg-[rgba(212,168,67,0.06)] p-5"><div className="flex items-start gap-3"><Youtube className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-light)]" aria-hidden="true" /><div><p className="eyebrow">02 / Video source</p><h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Give the review team a source.</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">For this first portal slice, share an unlisted or private YouTube URL. Hosted uploads are reserved for the reviewed storage pipeline.</p></div></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Source type *</span><select id="videoSourceType" name="videoSourceType" value={form.videoSourceType} onChange={updateField} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)]"><option value="youtube_unlisted">YouTube unlisted</option><option value="youtube_private">YouTube private</option><option value="hosted_upload">Hosted upload (coming soon)</option></select></label><Field id="videoSourceUrl" label="Review URL *" value={form.videoSourceUrl} onChange={updateField} placeholder="https://youtu.be/..." type="url" required /></div><Field id="thumbnailUrl" label="Thumbnail URL" value={form.thumbnailUrl} onChange={updateField} placeholder="https://…" type="url" /></div>

          <div className="rounded-2xl border border-[rgba(212,168,67,0.25)] bg-[rgba(212,168,67,0.06)] p-5"><div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-light)]" aria-hidden="true" /><div><p className="eyebrow">03 / Rights file</p><h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Make the permission legible.</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Star Lyrix cannot call a video official or publish it without a reviewable rights basis. Do not submit material you are not authorized to share.</p></div></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field id="rightsHolder" label="Copyright / publishing rights holder *" value={form.rightsHolder} onChange={updateField} required /><Field id="rightsEvidenceUrl" label="Rights evidence URL" value={form.rightsEvidenceUrl} onChange={updateField} placeholder="https://…" type="url" /><label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">Lyrics rights status</span><select id="lyricsRightsStatus" name="lyricsRightsStatus" value={form.lyricsRightsStatus} onChange={updateField} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)]"><option value="not_submitted">No lyrics submitted</option><option value="owned">Owned</option><option value="licensed">Licensed</option><option value="authorized">Authorized</option><option value="public_domain">Public domain</option></select></label><Field id="lyricsLicenseReference" label="Lyrics license reference" value={form.lyricsLicenseReference} onChange={updateField} placeholder="Required for licensed lyrics" type="url" /></div><div className="mt-5 space-y-3"><CheckField checked={rightsAttested} onChange={setRightsAttested}>I own or control the rights needed to submit this video and its associated song materials.</CheckField><CheckField checked={permissionToEdit} onChange={setPermissionToEdit}>I grant Star Lyrix permission to review, edit metadata, and prepare this submission for publication if approved.</CheckField><CheckField checked={permissionToPublish} onChange={setPermissionToPublish}>I authorize Star Lyrix to publish the approved video to the official @starlyrix channel.</CheckField></div></div>

          {error && <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200" role="alert">{error}</div>}
          {success && <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200" role="status">{success}</div>}
          <button type="submit" disabled={saving || loading} className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-55">{saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending to review…</> : <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Submit for rights review <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}</button>
        </form>

        <aside className="space-y-5">
          <div className="artist-pipeline-card"><p className="eyebrow">The release path</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">No shortcuts.<br /><span>Just a clear room.</span></h2><div className="artist-pipeline mt-7"><PipelineStep number="01" title="Submit" active /><PipelineStep number="02" title="Rights verification" /><PipelineStep number="03" title="Content review" /><PipelineStep number="04" title="Star Lyrix approval" /><PipelineStep number="05" title="Publish to @starlyrix" /></div><p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[var(--text-muted)]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-light)]" aria-hidden="true" /> Approval is never automatic. A submission is not public and is not a promise of publication.</p></div>
          <div className="surface-card p-5"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[var(--gold-light)]" aria-hidden="true" /><div><p className="eyebrow">Your submissions</p><h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Review desk</h2></div></div>{loading ? <div className="mt-5 flex items-center gap-2 text-sm text-[var(--text-secondary)]" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Loading submissions…</div> : submissions.length === 0 ? <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">Your first submission will appear here with its review state and any reviewer note.</p> : <div className="mt-5 space-y-3">{submissions.slice(0, 5).map((submission) => <div key={submission.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-[var(--text-primary)]">{submission.video_title}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{submission.artist_name} · {submission.song_title}</p></div><span className={`submission-status submission-status-${submission.status}`}>{submissionStatusLabel[submission.status] || submission.status}</span></div>{submission.reviewer_note && <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{submission.reviewer_note}</p>}</div>)}</div>}</div>
        </aside>
      </div>
    </div>
  );
};

const Field: React.FC<{ id: string; label: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; placeholder?: string; required?: boolean }> = ({ id, label, value, onChange, type = 'text', placeholder, required }) => <label className="block"><span className="block text-sm font-medium text-[var(--text-primary)]">{label}</span><input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} maxLength={type === 'url' ? 500 : 200} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" /></label>;

const CheckField: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; children: React.ReactNode }> = ({ checked, onChange, children }) => <label className="flex items-start gap-3 text-sm leading-6 text-[var(--text-secondary)]"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--gold-primary)]" /> <span>{children}</span></label>;

const PipelineStep: React.FC<{ number: string; title: string; active?: boolean }> = ({ number, title, active = false }) => <div className={`artist-pipeline-step ${active ? 'active' : ''}`}><span>{number}</span><strong>{title}</strong></div>;

export default ArtistSubmission;
