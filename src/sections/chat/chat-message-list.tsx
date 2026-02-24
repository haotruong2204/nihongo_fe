// @mui
import Box from '@mui/material/Box';
// types
import { IChatMessage } from 'src/types/chat';
// components
import Scrollbar from 'src/components/scrollbar';
//
import { useMessagesScroll } from './hooks';
import ChatMessageItem from './chat-message-item';

// ----------------------------------------------------------------------

type Props = {
  messages: IChatMessage[];
  adminId: string;
  participantPhoto?: string;
};

export default function ChatMessageList({ messages = [], adminId, participantPhoto }: Props) {
  const { messagesEndRef } = useMessagesScroll(messages);

  return (
    <Scrollbar sx={{ px: 3, py: 5, height: 1 }}>
      <Box>
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            adminId={adminId}
            participantPhoto={participantPhoto}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
    </Scrollbar>
  );
}
