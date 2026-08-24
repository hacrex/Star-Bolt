import React from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type ConnectionStatus = 'connecting' | 'live' | 'offline';

type CursorPayload = {
  userId: string;
  cursor: number | null;
  selectionLength: number;
  languageCode: string;
  timestamp: number;
};

type EditingPayload = {
  userId: string;
  isEditing: boolean;
  languageCode: string;
  timestamp: number;
};

type PresencePayload = {
  userId: string;
  displayName: string;
  color: string;
  cursor: number | null;
  selectionLength: number;
  isEditing: boolean;
  languageCode: string;
  lastActiveAt: number;
};

export type TranslationCollaborator = PresencePayload;

const COLLABORATOR_COLORS = ['#D4A843', '#D58B73', '#9DB69F', '#9FA8D7', '#D9B7A0'];

const colorForUser = (userId: string) => {
  const hash = Array.from(userId).reduce((total, character) => total + character.charCodeAt(0), 0);
  return COLLABORATOR_COLORS[hash % COLLABORATOR_COLORS.length];
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isCursorPayload = (value: unknown): value is CursorPayload => isRecord(value)
  && typeof value.userId === 'string'
  && (typeof value.cursor === 'number' || value.cursor === null)
  && typeof value.selectionLength === 'number'
  && typeof value.languageCode === 'string';

const isEditingPayload = (value: unknown): value is EditingPayload => isRecord(value)
  && typeof value.userId === 'string'
  && typeof value.isEditing === 'boolean'
  && typeof value.languageCode === 'string';

const presencePayloadFromState = (state: Record<string, unknown[]>) => Object.values(state).reduce<Record<string, TranslationCollaborator>>((result, entries) => {
  const latest = entries[entries.length - 1];
  if (!isRecord(latest) || typeof latest.userId !== 'string') return result;
  result[latest.userId] = {
    userId: latest.userId,
    displayName: typeof latest.displayName === 'string' ? latest.displayName : 'Lyric collaborator',
    color: typeof latest.color === 'string' ? latest.color : COLLABORATOR_COLORS[0],
    cursor: typeof latest.cursor === 'number' ? latest.cursor : null,
    selectionLength: typeof latest.selectionLength === 'number' ? latest.selectionLength : 0,
    isEditing: latest.isEditing === true,
    languageCode: typeof latest.languageCode === 'string' ? latest.languageCode : 'en',
    lastActiveAt: typeof latest.lastActiveAt === 'number' ? latest.lastActiveAt : Date.now(),
  };
  return result;
}, {});

export const useTranslationRealtime = (workspaceId: string | undefined, userId: string | undefined, displayName: string, languageCode: string) => {
  const [collaborators, setCollaborators] = React.useState<Record<string, TranslationCollaborator>>({});
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('connecting');
  const channelRef = React.useRef<RealtimeChannel | null>(null);
  const localRef = React.useRef<PresencePayload>({ userId: userId || 'anonymous', displayName, color: colorForUser(userId || 'anonymous'), cursor: null, selectionLength: 0, isEditing: false, languageCode, lastActiveAt: Date.now() });

  React.useEffect(() => {
    localRef.current = { ...localRef.current, userId: userId || 'anonymous', displayName, languageCode };
  }, [displayName, languageCode, userId]);

  React.useEffect(() => {
    if (!workspaceId || !userId) {
      setConnectionStatus('offline');
      return undefined;
    }

    let disposed = false;
    const channel = supabase.channel(`translation-workspace:${workspaceId}`, { config: { private: true, presence: { key: userId } } });
    channelRef.current = channel;
    setConnectionStatus(navigator.onLine ? 'connecting' : 'offline');

    const syncPresence = () => {
      if (disposed) return;
      const state = channel.presenceState() as Record<string, unknown[]>;
      setCollaborators((current) => ({ ...current, ...presencePayloadFromState(state) }));
    };

    channel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (!isCursorPayload(payload) || payload.userId === userId || Date.now() - payload.timestamp > 30_000) return;
        setCollaborators((current) => ({
          ...current,
          [payload.userId]: {
            ...(current[payload.userId] || { userId: payload.userId, displayName: 'Lyric collaborator', color: colorForUser(payload.userId), isEditing: false, languageCode: payload.languageCode, lastActiveAt: payload.timestamp }),
            cursor: payload.cursor,
            selectionLength: Math.max(0, payload.selectionLength),
            languageCode: payload.languageCode,
            lastActiveAt: payload.timestamp,
          },
        }));
      })
      .on('broadcast', { event: 'editing' }, ({ payload }) => {
        if (!isEditingPayload(payload) || payload.userId === userId || Date.now() - payload.timestamp > 30_000) return;
        setCollaborators((current) => ({
          ...current,
          [payload.userId]: {
            ...(current[payload.userId] || { userId: payload.userId, displayName: 'Lyric collaborator', color: colorForUser(payload.userId), cursor: null, selectionLength: 0, lastActiveAt: payload.timestamp }),
            isEditing: payload.isEditing,
            languageCode: payload.languageCode,
            lastActiveAt: payload.timestamp,
          },
        }));
      })
      .subscribe(async (status) => {
        if (disposed) return;
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('live');
          localRef.current = { ...localRef.current, lastActiveAt: Date.now() };
          await channel.track(localRef.current);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('offline');
        }
      });

    const onOnline = () => setConnectionStatus('connecting');
    const onOffline = () => setConnectionStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      disposed = true;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      channel.untrack().catch(() => undefined);
      void supabase.removeChannel(channel);
      channelRef.current = null;
      setCollaborators({});
    };
  }, [userId, workspaceId]);

  const publishPresence = React.useCallback(async (patch: Partial<PresencePayload>) => {
    const channel = channelRef.current;
    if (!channel || !userId) return;
    localRef.current = { ...localRef.current, ...patch, userId, lastActiveAt: Date.now() };
    await channel.track(localRef.current);
  }, [userId]);

  const publishCursor = React.useCallback(async (cursor: number | null, selectionLength: number) => {
    const channel = channelRef.current;
    if (!channel || !userId) return;
    const payload: CursorPayload = { userId, cursor, selectionLength: Math.max(0, selectionLength), languageCode, timestamp: Date.now() };
    await publishPresence({ cursor, selectionLength: payload.selectionLength });
    await channel.send({ type: 'broadcast', event: 'cursor', payload });
  }, [languageCode, publishPresence, userId]);

  const publishEditing = React.useCallback(async (isEditing: boolean) => {
    const channel = channelRef.current;
    if (!channel || !userId) return;
    const payload: EditingPayload = { userId, isEditing, languageCode, timestamp: Date.now() };
    await publishPresence({ isEditing });
    await channel.send({ type: 'broadcast', event: 'editing', payload });
  }, [languageCode, publishPresence, userId]);

  const remoteCollaborators = React.useMemo(() => Object.values(collaborators).filter((collaborator) => collaborator.userId !== userId && Date.now() - collaborator.lastActiveAt < 60_000), [collaborators, userId]);

  return { collaborators: remoteCollaborators, connectionStatus, publishCursor, publishEditing };
};
