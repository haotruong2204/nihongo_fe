// eslint-disable-next-line import/no-duplicates
import { format, isSameDay } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// types
import { IChatMessage } from 'src/types/chat';
// components
import Scrollbar from 'src/components/scrollbar';
//
import { useMessagesScroll } from './hooks';
import ChatMessageItem from './chat-message-item';

// ----------------------------------------------------------------------

// Messages within 2 minutes from the same sender are grouped
const GROUP_THRESHOLD_MS = 2 * 60 * 1000;

// Show centered time separator when gap > 5 minutes
const TIME_SEPARATOR_THRESHOLD_MS = 5 * 60 * 1000;

function formatTimeSeparator(date: Date, prevDate?: Date): string {
  if (prevDate && isSameDay(date, prevDate)) {
    return format(date, 'HH:mm');
  }
  return format(date, 'HH:mm dd/M/yy');
}

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
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];

          const currentDate = message.createdAt?.toDate?.();
          const prevDate = prevMessage?.createdAt?.toDate?.();
          const nextDate = nextMessage?.createdAt?.toDate?.();

          // Show centered time separator when time gap > threshold
          const timeGap =
            currentDate && prevDate
              ? currentDate.getTime() - prevDate.getTime()
              : null;

          const showTimeSeparator =
            currentDate && (!prevDate || (timeGap && timeGap > TIME_SEPARATOR_THRESHOLD_MS));

          // Same sender and within threshold => group together
          const isSameSenderAsPrev =
            prevMessage &&
            prevMessage.senderId === message.senderId &&
            currentDate &&
            prevDate &&
            isSameDay(currentDate, prevDate) &&
            currentDate.getTime() - prevDate.getTime() < GROUP_THRESHOLD_MS;

          const isSameSenderAsNext =
            nextMessage &&
            nextMessage.senderId === message.senderId &&
            currentDate &&
            nextDate &&
            isSameDay(currentDate, nextDate) &&
            nextDate.getTime() - currentDate.getTime() < GROUP_THRESHOLD_MS;

          const isFirstInGroup = !isSameSenderAsPrev;
          const isLastInGroup = !isSameSenderAsNext;

          return (
            <Box key={message.id}>
              {showTimeSeparator && currentDate && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                    my: 3,
                  }}
                >
                  {formatTimeSeparator(currentDate, prevDate ?? undefined)}
                </Typography>
              )}
              <ChatMessageItem
                message={message}
                adminId={adminId}
                participantPhoto={participantPhoto}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
              />
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>
    </Scrollbar>
  );
}
