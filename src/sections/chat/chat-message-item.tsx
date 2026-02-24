import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
// types
import { IChatMessage } from 'src/types/chat';

// ----------------------------------------------------------------------

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <Link key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </Link>
    ) : (
      part
    )
  );
}

// ----------------------------------------------------------------------

type Props = {
  message: IChatMessage;
  adminId: string;
  participantPhoto?: string;
};

export default function ChatMessageItem({ message, adminId, participantPhoto }: Props) {
  const me = message.senderId === adminId;

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const createdAtDate = message.createdAt?.toDate?.();

  const renderInfo = (
    <Typography
      noWrap
      variant="caption"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...(!me && {
          mr: 'auto',
        }),
      }}
    >
      {!me && `${message.senderName},`} &nbsp;
      {createdAtDate &&
        formatDistanceToNowStrict(createdAtDate, {
          addSuffix: true,
        })}
    </Typography>
  );

  const renderBody = (
    <Stack
      sx={{
        p: 1.5,
        minWidth: 48,
        maxWidth: 320,
        borderRadius: 1,
        typography: 'body2',
        bgcolor: 'background.neutral',
        ...(me && {
          color: 'grey.800',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {message.imageUrl && (
        <Box
          component="img"
          src={message.imageUrl}
          sx={{
            maxWidth: 200,
            borderRadius: 1,
            cursor: 'pointer',
            mb: message.text ? 1 : 0,
          }}
          onClick={() => setLightboxOpen(true)}
        />
      )}
      {message.text && <Typography variant="body2">{renderTextWithLinks(message.text)}</Typography>}
    </Stack>
  );

  return (
    <Stack direction="row" justifyContent={me ? 'flex-end' : 'unset'} sx={{ mb: 5 }}>
      {!me && (
        <Avatar
          alt={message.senderName}
          src={participantPhoto}
          sx={{ width: 32, height: 32, mr: 2 }}
        />
      )}

      <Stack alignItems={me ? 'flex-end' : 'flex-start'}>
        {renderInfo}

        <Stack
          direction="row"
          alignItems="center"
          sx={{ position: 'relative' }}
        >
          {renderBody}
        </Stack>
      </Stack>

      {message.imageUrl && (
        <Dialog
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          maxWidth="md"
          PaperProps={{
            sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' },
          }}
        >
          <Box
            component="img"
            src={message.imageUrl}
            onClick={() => setLightboxOpen(false)}
            sx={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', cursor: 'pointer' }}
          />
        </Dialog>
      )}
    </Stack>
  );
}
