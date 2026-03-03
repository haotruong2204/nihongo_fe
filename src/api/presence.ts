import { useEffect, useRef, useCallback } from 'react';
// utils
import { getCableConsumer } from 'src/utils/actioncable';

// ----------------------------------------------------------------------

type PresenceChangeData = {
  type: 'presence_change';
  user_id: string;
  is_online: boolean;
};

type UsePresenceChannelOptions = {
  onPresenceChange?: (data: PresenceChangeData) => void;
};

export function usePresenceChannel({ onPresenceChange }: UsePresenceChannelOptions = {}) {
  const subscriptionRef = useRef<any>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    const consumer = getCableConsumer();
    if (!consumer) return undefined;

    subscriptionRef.current = consumer.subscriptions.create(
      { channel: 'PresenceChannel' },
      {
        connected() {
          // Send heartbeat every 30s to keep presence alive
          heartbeatRef.current = setInterval(() => {
            if (subscriptionRef.current) {
              subscriptionRef.current.perform('heartbeat');
            }
          }, 30000);
        },
        received(data: PresenceChangeData) {
          if (data?.type === 'presence_change' && onPresenceChange) {
            onPresenceChange(data);
          }
        },
      }
    );

    return cleanup;
  }, [onPresenceChange, cleanup]);
}
