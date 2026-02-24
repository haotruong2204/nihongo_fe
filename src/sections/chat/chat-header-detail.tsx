// @mui
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import { IChatRoom, IChatRoomMeta } from 'src/types/chat';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  room: IChatRoom;
  meta?: IChatRoomMeta;
};

export default function ChatHeaderDetail({ room, meta }: Props) {
  const displayName = meta?.user?.display_name || room.participantName;
  const avatarUrl = meta?.user?.photo_url || room.participantPhoto;

  return (
    <>
      <Stack flexGrow={1} direction="row" alignItems="center" spacing={2}>
        <Avatar src={avatarUrl} alt={displayName} />

        <ListItemText
          primary={displayName}
          secondary={meta?.user?.email}
          primaryTypographyProps={{ variant: 'subtitle2' }}
          secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
        />

        {meta?.user?.is_premium && (
          <Chip label="Premium" size="small" color="warning" variant="outlined" />
        )}

        {room.chatBanned && (
          <Chip label="Chat Banned" size="small" color="error" variant="outlined" />
        )}

        {meta?.user?.is_banned && (
          <Chip label="Account Banned" size="small" color="error" variant="outlined" />
        )}
      </Stack>

      <Stack flexGrow={1} />

      <IconButton>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </>
  );
}
