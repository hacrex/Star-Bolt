import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="surface-card overflow-hidden">
        <div className="relative border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(212,168,67,0.12)] blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(212,168,67,0.35)] bg-[var(--bg-surface)] text-[var(--gold-light)] shadow-[var(--shadow-glow)]">
              <User className="h-10 w-10" />
            </div>
            <div><p className="eyebrow">Your account</p><h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{profile.username}</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">{user.email}</p></div>
          </div>
        </div>
        <div className="p-8"><p className="eyebrow">Account details</p><h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Your Star Lyrix profile</h2><p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">Member since {new Date(profile.created_at).toLocaleDateString()}. Your playlists, generated lyrics, ratings, and community notes live here.</p></div>
      </div>
    </div>
  );
};

export default Profile;