import { useEffect, useRef } from 'react';
// types
import { IChatMessage } from 'src/types/chat';

// ----------------------------------------------------------------------

export default function useMessagesScroll(messages: IChatMessage[]) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messages?.length || !messagesEndRef.current) return undefined;

    // Delay to ensure DOM has rendered
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  return {
    messagesEndRef,
  };
}
