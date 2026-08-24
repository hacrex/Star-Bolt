import React from 'react';

type LyricSyncStatusProps = {
  isAuthorized: boolean;
  isPlaying: boolean;
  currentCue: number | null;
  cueCount: number;
  cueProgress: number;
};

const LyricSyncStatus: React.FC<LyricSyncStatusProps> = ({ isAuthorized, isPlaying, currentCue, cueCount, cueProgress }) => {
  const percentage = Math.min(100, Math.max(0, cueProgress * 100));
  const label = !isAuthorized ? 'Manual reading' : isPlaying ? 'Live lyric sync' : 'Ready to sync';
  const isLive = isAuthorized && isPlaying && cueCount > 0;

  return (
    <div className={`reading-room-sync-status ${isAuthorized ? 'is-authorized' : 'is-manual'} ${isLive ? 'is-live' : ''}`} aria-label={`${label}. ${cueCount > 0 ? `${currentCue === null ? 0 : currentCue + 1} of ${cueCount} lyric cues` : 'No synchronized cues available'}`}>
      <span className="reading-room-sync-pulse" aria-hidden="true" />
      <span className="reading-room-sync-label">{label}</span>
      {cueCount > 0 ? (
        <>
          <span className="reading-room-sync-count">{currentCue === null ? '—' : `${String(currentCue + 1).padStart(2, '0')} / ${String(cueCount).padStart(2, '0')}`}</span>
          <span className="reading-room-sync-track" aria-hidden="true"><span style={{ width: `${percentage}%` }} /></span>
        </>
      ) : <span className="reading-room-sync-count">Cue-free</span>}
    </div>
  );
};

export default LyricSyncStatus;
