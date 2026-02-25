import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { useRouter } from 'src/routes/hooks';
// api
import {
  useGetNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from 'src/api/notification';
// components
import { useSettingsContext } from 'src/components/settings';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
// utils
import { fToNow } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function NotificationsView() {
  const settings = useSettingsContext();
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    notificationsLoading,
    notificationsMutate,
  } = useGetNotifications();

  const handleClick = useCallback(
    async (notification: (typeof notifications)[0]) => {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        notificationsMutate();
      }
      if (notification.link) {
        router.push(`/dashboard${notification.link}`);
      }
    },
    [router, notificationsMutate]
  );

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    notificationsMutate();
  }, [notificationsMutate]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'md'}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Thông báo
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              color="error"
              size="small"
              sx={{ ml: 1, fontWeight: 'bold' }}
            />
          )}
        </Typography>

        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<Iconify icon="eva:done-all-fill" />}
            onClick={handleMarkAllRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </Stack>

      {notificationsLoading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!notificationsLoading && notifications.length === 0 && (
        <EmptyContent title="Chưa có thông báo nào" />
      )}

      {!notificationsLoading && notifications.length > 0 && (
        <Card>
          {notifications.map((notification) => (
            <ListItemButton
              key={notification.id}
              onClick={() => handleClick(notification)}
              sx={{
                py: 1.5,
                px: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                ...(!notification.read && {
                  bgcolor: 'action.selected',
                }),
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                <Iconify
                  icon={
                    notification.notification_type === 'feedback'
                      ? 'solar:chat-round-dots-bold'
                      : 'solar:bell-bold'
                  }
                  width={24}
                  sx={{
                    color: notification.read ? 'text.disabled' : 'primary.main',
                  }}
                />
              </Box>

              <ListItemText
                primary={notification.title}
                secondary={
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {fToNow(notification.created_at)}
                    </Typography>
                    {notification.body && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 300,
                        }}
                      >
                        — {notification.body}
                      </Typography>
                    )}
                  </Stack>
                }
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  sx: { color: notification.read ? 'text.secondary' : 'text.primary' },
                }}
              />

              {!notification.read && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    ml: 1,
                    flexShrink: 0,
                  }}
                />
              )}
            </ListItemButton>
          ))}
        </Card>
      )}
    </Container>
  );
}
