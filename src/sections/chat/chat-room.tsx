import { useEffect, useCallback, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from 'src/lib/firebase';
// utils
import { fDateTime } from 'src/utils/format-time';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// types
import { IChatRoom, IChatRoomMeta } from 'src/types/chat';
// api
import { deleteChatRoom } from 'src/api/chat';
// components
import Iconify from 'src/components/iconify';
//
import { useCollapseNav } from './hooks';

// ----------------------------------------------------------------------

const NAV_WIDTH = 240;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, maxWidth: 140, textAlign: 'right' }}
          noWrap
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Stack>
  );
}

type Props = {
  room: IChatRoom;
  meta?: IChatRoomMeta;
  onMetaUpdate?: () => void;
  onDelete?: () => void;
};

export default function ChatRoom({ room, meta, onMetaUpdate, onDelete }: Props) {
  const theme = useTheme();

  const lgUp = useResponsive('up', 'lg');

  const {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav();

  useEffect(() => {
    if (!lgUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, lgUp]);

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lgUp]);

  const [banReason, setBanReason] = useState('');
  const [banLoading, setBanLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmDelete = useCallback(async () => {
    if (!room.id) return;
    setDeleteLoading(true);
    try {
      await deleteChatRoom(room.id);
      setDeleteOpen(false);
      onDelete?.();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  }, [room.id, onDelete]);

  const handleToggleBan = useCallback(async () => {
    const chatId = room.id;
    if (!chatId) return;
    setBanLoading(true);
    try {
      const isBanned = room.chatBanned;
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        chatBanned: !isBanned,
        chatBanReason: isBanned ? '' : banReason,
      });
      setBanReason('');
    } catch (error) {
      console.error(error);
    } finally {
      setBanLoading(false);
    }
  }, [room.id, room.chatBanned, banReason]);

  const displayName = meta?.user?.display_name || room.participantName;
  const avatarUrl = meta?.user?.photo_url || room.participantPhoto;

  console.log('data user', meta?.user);

  const renderContent = (
    <Stack sx={{ py: 2.5, px: 2, height: 1, overflow: 'auto' }}>
      <Stack alignItems="center" sx={{ flexShrink: 0 }}>
        <Avatar alt={displayName} src={avatarUrl} sx={{ width: 64, height: 64, mb: 1 }} />
        <Typography variant="subtitle2">{displayName}</Typography>
        {meta?.user && (
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            spacing={0.5}
            sx={{ mt: 0.5 }}
          >
            <Chip
              // eslint-disable-next-line no-nested-ternary
              label={
                // eslint-disable-next-line no-nested-ternary
                meta.user.is_premium
                  ? meta.user.premium_until
                    ? `Premium → ${meta.user.premium_until.slice(0, 10)}`
                    : 'Premium'
                  : 'Free'
              }
              size="small"
              color={meta.user.is_premium ? 'warning' : 'default'}
              variant="outlined"
            />
            {meta.user.is_banned && (
              <Chip label="Banned" size="small" color="error" variant="outlined" />
            )}
          </Stack>
        )}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={0.75}>
        {meta?.user?.email && <InfoRow label="Email" value={meta.user.email} />}

        {meta?.user?.uid && <InfoRow label="UID" value={meta.user.uid} />}

        <InfoRow
          label="Last login"
          value={
            meta?.user?.last_login_at
              ? formatDistanceToNowStrict(new Date(meta.user.last_login_at), { addSuffix: true })
              : '—'
          }
        />

        <InfoRow
          label="Joined"
          value={
            meta?.user?.created_at
              ? fDateTime(meta.user.created_at)
              : '—'
          }
        />

        {meta?.status && (
          <InfoRow
            label="Status"
            value={<Chip label={meta.status} size="small" variant="outlined" />}
          />
        )}
      </Stack>

      {meta?.admin_note && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Admin Note
            </Typography>
            <Typography variant="body2">{meta.admin_note}</Typography>
          </Stack>
        </>
      )}

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={1}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Chat Ban
        </Typography>

        {room.chatBanned ? (
          <Stack spacing={1}>
            <Chip label="Chat Banned" size="small" color="error" />
            {room.chatBanReason && (
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                Reason: {room.chatBanReason}
              </Typography>
            )}
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={handleToggleBan}
              disabled={banLoading}
            >
              Unban Chat
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <TextField
              size="small"
              placeholder="Ban reason (optional)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              multiline
              maxRows={3}
            />
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleToggleBan}
              disabled={banLoading}
            >
              Ban Chat
            </Button>
          </Stack>
        )}
      </Stack>

      {!meta?.user && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {room.participantId}
        </Typography>
      )}

      <Divider sx={{ my: 1.5 }} />

      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={() => setDeleteOpen(true)}
        fullWidth
      >
        Xóa đoạn chat
      </Button>

      <Dialog open={deleteOpen} onClose={() => !deleteLoading && setDeleteOpen(false)}>
        <DialogTitle>Xóa đoạn chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Toàn bộ tin nhắn trong đoạn chat với <strong>{displayName}</strong> sẽ bị xóa vĩnh viễn.
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );

  const renderToggleBtn = (
    <IconButton
      onClick={handleToggleNav}
      sx={{
        top: 12,
        right: 0,
        zIndex: 9,
        width: 32,
        height: 32,
        borderRight: 0,
        position: 'absolute',
        borderRadius: `12px 0 0 12px`,
        boxShadow: theme.customShadows.z8,
        bgcolor: theme.palette.background.paper,
        border: `solid 1px ${theme.palette.divider}`,
        '&:hover': {
          bgcolor: theme.palette.background.neutral,
        },
        ...(lgUp && {
          ...(!collapseDesktop && {
            right: NAV_WIDTH,
          }),
        }),
      }}
    >
      {lgUp ? (
        <Iconify
          width={16}
          icon={collapseDesktop ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'}
        />
      ) : (
        <Iconify width={16} icon="eva:arrow-ios-back-fill" />
      )}
    </IconButton>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {renderToggleBtn}

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderLeft: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: 0,
            }),
          }}
        >
          {!collapseDesktop && renderContent}
        </Stack>
      ) : (
        <Drawer
          anchor="right"
          open={openMobile}
          onClose={onCloseMobile}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
