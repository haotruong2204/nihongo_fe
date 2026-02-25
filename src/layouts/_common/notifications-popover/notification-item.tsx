// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
// utils
import { fToNow } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
// types
import { INotificationItem } from 'src/types/notification';

// ----------------------------------------------------------------------

type Props = {
  notification: INotificationItem;
  onClick: (notification: INotificationItem) => void;
};

export default function NotificationItem({ notification, onClick }: Props) {
  return (
    <ListItemButton
      onClick={() => onClick(notification)}
      sx={{
        py: 1.5,
        px: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
        ...(!notification.read && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      {!notification.read && (
        <Box
          sx={{
            top: 26,
            width: 8,
            height: 8,
            right: 20,
            borderRadius: '50%',
            bgcolor: 'info.main',
            position: 'absolute',
          }}
        />
      )}

      <Stack sx={{ mr: 2, mt: 0.5 }}>
        <Iconify
          icon="solar:chat-round-dots-bold"
          width={22}
          sx={{ color: notification.read ? 'text.disabled' : 'primary.main' }}
        />
      </Stack>

      <ListItemText
        disableTypography
        primary={
          <Typography
            variant="subtitle2"
            sx={{ color: notification.read ? 'text.secondary' : 'text.primary' }}
          >
            {notification.title}
          </Typography>
        }
        secondary={
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {notification.body && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 280,
                }}
              >
                {notification.body}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {fToNow(notification.created_at)}
            </Typography>
          </Stack>
        }
      />
    </ListItemButton>
  );
}
