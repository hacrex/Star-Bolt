import React from 'react';
import { Circle, Radio, Users } from 'lucide-react';
import type { TranslationCollaborator } from '../hooks/useTranslationRealtime';
import { languageLabel } from '../lib/discovery';

type CollaboratorPresenceProps = {
  collaborators: TranslationCollaborator[];
  connectionStatus: 'connecting' | 'live' | 'offline';
  draft: string;
};

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'LC';

const cursorLine = (draft: string, cursor: number | null) => {
  if (cursor === null) return null;
  const bounded = Math.max(0, Math.min(cursor, draft.length));
  return draft.slice(0, bounded).split('\n').length - 1;
};

const CollaboratorPresence: React.FC<CollaboratorPresenceProps> = ({ collaborators, connectionStatus, draft }) => {
  const editingCollaborators = collaborators.filter((collaborator) => collaborator.isEditing);
  const statusLabel = connectionStatus === 'live' ? 'Live room' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline mode';

  return (
    <div className="collaborator-presence" aria-label={`${statusLabel}. ${collaborators.length} other collaborator${collaborators.length === 1 ? '' : 's'} present`}>
      <div className={`collaborator-connection collaborator-connection-${connectionStatus}`}><Radio className="h-3.5 w-3.5" /><span>{statusLabel}</span></div>
      {collaborators.length > 0 ? <div className="collaborator-avatar-stack" aria-label="Other collaborators">{collaborators.map((collaborator) => <span key={collaborator.userId} className={`collaborator-avatar ${collaborator.isEditing ? 'is-editing' : ''}`} style={{ '--collaborator-color': collaborator.color } as React.CSSProperties} title={`${collaborator.displayName} · ${languageLabel(collaborator.languageCode)}`} aria-label={`${collaborator.displayName} is ${collaborator.isEditing ? 'editing' : 'reading'}`}><span>{initials(collaborator.displayName)}</span></span>)}</div> : <span className="collaborator-empty"><Users className="h-3.5 w-3.5" /> You are the only one here</span>}
      {editingCollaborators.length > 0 && <span className="collaborator-editing-copy"><Circle className="h-2 w-2 fill-current" />{editingCollaborators.length === 1 ? `${editingCollaborators[0].displayName} is editing` : `${editingCollaborators.length} collaborators are editing`}</span>}
      {collaborators.map((collaborator) => { const line = cursorLine(draft, collaborator.cursor); return line === null ? null : <span key={`${collaborator.userId}-cursor`} className="remote-cursor-marker" style={{ '--collaborator-color': collaborator.color } as React.CSSProperties} title={`${collaborator.displayName}'s cursor`} aria-hidden="true"><span>{initials(collaborator.displayName)}</span><small>line {line + 1}</small></span>; })}
    </div>
  );
};

export default CollaboratorPresence;
