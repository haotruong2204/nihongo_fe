import { useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// types
import { IChatRoom, IChatRoomMeta } from 'src/types/chat';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  collapse: boolean;
  room: IChatRoom;
  onSelectRoom: (roomId: string) => void;
  onCloseMobile: VoidFunction;
  meta?: IChatRoomMeta;
};

export default function ChatNavItem({ selected, collapse, room, onSelectRoom, onCloseMobile, meta }: Props) {
  const mdUp = useResponsive('up', 'md');

  const handleClick = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }
    onSelectRoom(room.id);
  }, [room.id, mdUp, onCloseMobile, onSelectRoom]);

  const lastActivityDate = room.lastMessageAt?.toDate?.();

  const displayName = meta?.user?.display_name || room.participantName;
  const avatarUrl = meta?.user?.photo_url || room.participantPhoto;

  return (
    <ListItemButton
      disableGutters
      onClick={handleClick}
      sx={{
        py: 1.5,
        px: 2.5,
        ...(selected && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <Badge
        color="error"
        overlap="circular"
        badgeContent={collapse ? room.adminUnread : 0}
      >
        <Avatar
          alt={displayName}
          src={avatarUrl}
          sx={{ width: 48, height: 48 }}
        />
      </Badge>

      {!collapse && (
        <>
          <ListItemText
            sx={{ ml: 2 }}
            primary={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="subtitle2" noWrap>{displayName}</Typography>
                {meta?.user?.is_premium && (
                  <Box component="span" sx={{ color: 'warning.main', fontSize: 14, lineHeight: 1 }}>&#9733;</Box>
                )}
                {room.chatBanned && (
                  <Box component="span" sx={{ color: 'error.main', fontSize: 14, lineHeight: 1 }} title="Chat Banned">&#9888;</Box>
                )}
              </Stack>
            }
            secondary={room.lastMessage}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              variant: room.adminUnread ? 'subtitle2' : 'body2',
              color: room.adminUnread ? 'text.primary' : 'text.secondary',
            }}
          />

          <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
            {lastActivityDate && (
              <Typography
                noWrap
                variant="body2"
                component="span"
                sx={{
                  mb: 1.5,
                  fontSize: 12,
                  color: 'text.disabled',
                }}
              >
                {formatDistanceToNowStrict(lastActivityDate, {
                  addSuffix: false,
                })}
              </Typography>
            )}

            {!!room.adminUnread && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: 'info.main',
                  borderRadius: '50%',
                }}
              />
            )}
          </Stack>
        </>
      )}
    </ListItemButton>
  );
}
