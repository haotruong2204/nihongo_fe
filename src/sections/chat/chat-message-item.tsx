import { useState } from 'react';
import { format } from 'date-fns';
// @mui
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
// types
import { IChatMessage } from 'src/types/chat';

// ----------------------------------------------------------------------

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const IMAGE_EXT_REGEX = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;

function isImageUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    return IMAGE_EXT_REGEX.test(pathname);
  } catch {
    return IMAGE_EXT_REGEX.test(url);
  }
}

type TextPart = { type: 'text'; content: string } | { type: 'link'; url: string } | { type: 'image'; url: string };

function parseTextParts(text: string): TextPart[] {
  const parts = text.split(URL_REGEX);
  return parts
    .filter((p) => p.length > 0)
    .map((part) => {
      if (URL_REGEX.test(part)) {
        return isImageUrl(part) ? { type: 'image', url: part } : { type: 'link', url: part };
      }
      return { type: 'text', content: part };
    });
}

function RenderTextWithLinks({
  text,
  isMe,
  onImageClick,
}: {
  text: string;
  isMe: boolean;
  onImageClick: (url: string) => void;
}) {
  const parts = parseTextParts(text);
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'image') {
          return (
            <Box
              key={i}
              component="img"
              src={part.url}
              sx={{
                maxWidth: 200,
                borderRadius: 1,
                cursor: 'pointer',
                display: 'block',
                my: 0.5,
              }}
              onClick={() => onImageClick(part.url)}
            />
          );
        }
        if (part.type === 'link') {
          return (
            <Link
              key={i}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: isMe ? 'primary.dark' : 'primary.main',
                fontWeight: 600,
                textDecorationColor: 'inherit',
              }}
            >
              {part.url}
            </Link>
          );
        }
        return <span key={i}>{part.content}</span>;
      })}
    </>
  );
}

// ----------------------------------------------------------------------

type Props = {
  message: IChatMessage;
  adminId: string;
  participantPhoto?: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
};

export default function ChatMessageItem({
  message,
  adminId,
  participantPhoto,
  isFirstInGroup = true,
  isLastInGroup = true,
}: Props) {
  const me = message.senderId === adminId;

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const showAvatar = !me && isLastInGroup;

  const createdAtDate = message.createdAt?.toDate?.();
  const tooltipTime = createdAtDate ? format(createdAtDate, 'HH:mm dd/MM/yyyy') : '';

  const handleImageClick = (url: string) => setLightboxSrc(url);

  const renderBody = (
    <Stack
      sx={{
        p: 1.5,
        minWidth: 48,
        maxWidth: 320,
        borderRadius: 1,
        typography: 'body2',
        bgcolor: 'background.neutral',
        overflowWrap: 'anywhere',
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
          onClick={() => handleImageClick(message.imageUrl!)}
        />
      )}
      {message.text && (
        <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
          <RenderTextWithLinks text={message.text} isMe={me} onImageClick={handleImageClick} />
        </Typography>
      )}
    </Stack>
  );

  return (
    <Stack
      direction="row"
      justifyContent={me ? 'flex-end' : 'unset'}
      alignItems="flex-end"
      sx={{
        mb: isLastInGroup ? 2.5 : 0.25,
        ...(!me && { ml: showAvatar ? 0 : 6 }),
      }}
    >
      {!me && showAvatar && (
        <Avatar
          alt={message.senderName}
          src={participantPhoto}
          sx={{ width: 32, height: 32, mr: 2 }}
        />
      )}

      <Tooltip title={tooltipTime} placement={me ? 'left' : 'right'} arrow>
        <Stack alignItems={me ? 'flex-end' : 'flex-start'}>
          {renderBody}
        </Stack>
      </Tooltip>

      <Dialog
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        maxWidth="md"
        PaperProps={{
          sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' },
        }}
      >
        {lightboxSrc && (
          <Box
            component="img"
            src={lightboxSrc}
            onClick={() => setLightboxSrc(null)}
            sx={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', cursor: 'pointer' }}
          />
        )}
      </Dialog>
    </Stack>
  );
}
