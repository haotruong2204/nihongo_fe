import { m } from 'framer-motion';
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// api
import {
  useGetNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from 'src/api/notification';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
// types
import { INotificationItem } from 'src/types/notification';
//
import NotificationItem from './notification-item';

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const drawer = useBoolean();
  const smUp = useResponsive('up', 'sm');
  const router = useRouter();

  const { notifications, unreadCount, notificationsMutate } = useGetNotifications();

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllNotificationsRead();
    notificationsMutate();
  }, [notificationsMutate]);

  const handleClick = useCallback(
    async (notification: INotificationItem) => {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        notificationsMutate();
      }
      drawer.onFalse();
      if (notification.link) {
        router.push(`/dashboard${notification.link}`);
      }
    },
    [router, notificationsMutate, drawer]
  );

  const handleViewAll = useCallback(() => {
    drawer.onFalse();
    router.push(paths.dashboard.notifications);
  }, [drawer, router]);

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Thông báo
      </Typography>

      {!!unreadCount && (
        <Tooltip title="Đánh dấu tất cả đã đọc">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderList = (
    <Scrollbar>
      {notifications.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <Iconify icon="solar:bell-off-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chưa có thông báo
          </Typography>
        </Stack>
      ) : (
        <List disablePadding>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleClick}
            />
          ))}
        </List>
      )}
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Divider />

        {renderList}

        <Box sx={{ p: 1 }}>
          <Button fullWidth size="large" onClick={handleViewAll}>
            Xem tất cả
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
