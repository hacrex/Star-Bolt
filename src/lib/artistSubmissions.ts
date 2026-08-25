import { supabase } from './supabase';
import type { Database } from './database.types';

export type ArtistProfile = Database['public']['Tables']['artist_profiles']['Row'];
export type ArtistProfileInsert = Database['public']['Tables']['artist_profiles']['Insert'];
export type ArtistVideoSubmission = Database['public']['Tables']['artist_video_submissions']['Row'];
export type ArtistVideoSubmissionInsert = Database['public']['Tables']['artist_video_submissions']['Insert'];
export type ArtistSubmissionEvent = Database['public']['Tables']['artist_submission_events']['Row'];

export const submissionStatusLabel: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  rights_review: 'Rights review',
  content_review: 'Content review',
  changes_requested: 'Changes requested',
  approved: 'Approved',
  publish_queued: 'Publish queued',
  published: 'Published',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function listArtistProfiles(ownerId: string): Promise<ArtistProfile[]> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data || [];
}

export async function createArtistProfile(profile: ArtistProfileInsert): Promise<ArtistProfile> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .insert(profile)
    .select('*')
    .single();
  throwIfError(error);
  if (!data) throw new Error('Artist profile was not returned.');
  return data;
}

export async function listArtistSubmissions(ownerId: string): Promise<ArtistVideoSubmission[]> {
  const { data, error } = await supabase
    .from('artist_video_submissions')
    .select('*')
    .eq('created_by', ownerId)
    .order('updated_at', { ascending: false });
  throwIfError(error);
  return data || [];
}

export async function createArtistSubmission(submission: ArtistVideoSubmissionInsert): Promise<ArtistVideoSubmission> {
  const { data, error } = await supabase
    .from('artist_video_submissions')
    .insert(submission)
    .select('*')
    .single();
  throwIfError(error);
  if (!data) throw new Error('Submission was not returned.');
  return data;
}

export async function finalizeArtistSubmission(submissionId: string): Promise<ArtistVideoSubmission> {
  const { data, error } = await supabase.rpc('submit_artist_video_submission', {
    p_submission_id: submissionId,
    p_rights_attested: true,
    p_permission_to_edit: true,
    p_permission_to_publish: true,
  });
  throwIfError(error);
  if (!data) throw new Error('Submission finalization did not return a record.');
  return data;
}

export async function listArtistSubmissionEvents(submissionId: string): Promise<ArtistSubmissionEvent[]> {
  const { data, error } = await supabase
    .from('artist_submission_events')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data || [];
}
