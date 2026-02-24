import { useState, useEffect, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// types
import { IChatRoom, IChatRoomMeta } from 'src/types/chat';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
//
import { useCollapseNav } from './hooks';
import ChatNavItem from './chat-nav-item';
import ChatNavAccount from './chat-nav-account';
import { ChatNavItemSkeleton } from './chat-skeleton';
import ChatNewDialog from './chat-new-dialog';

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;

const NAV_COLLAPSE_WIDTH = 96;

type Props = {
  loading: boolean;
  selectedChatId: string;
  chatRooms: IChatRoom[];
  onSelectRoom: (roomId: string) => void;
  roomsMeta: Record<string, IChatRoomMeta>;
};

export default function ChatNav({
  loading,
  chatRooms,
  selectedChatId,
  onSelectRoom,
  roomsMeta,
}: Props) {
  const [newChatOpen, setNewChatOpen] = useState(false);
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

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
    if (!mdUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, mdUp]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const renderToggleBtn = (
    <IconButton
      onClick={onOpenMobile}
      sx={{
        left: 0,
        top: 84,
        zIndex: 9,
        width: 32,
        height: 32,
        position: 'absolute',
        borderRadius: `0 12px 12px 0`,
        bgcolor: theme.palette.primary.main,
        boxShadow: theme.customShadows.primary,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          bgcolor: theme.palette.primary.darker,
        },
      }}
    >
      <Iconify width={16} icon="solar:users-group-rounded-bold" />
    </IconButton>
  );

  const renderSkeleton = (
    <>
      {[...Array(12)].map((_, index) => (
        <ChatNavItemSkeleton key={index} />
      ))}
    </>
  );

  const renderList = (
    <>
      {chatRooms.map((room) => (
        <ChatNavItem
          key={room.id}
          room={room}
          collapse={collapseDesktop}
          selected={room.id === selectedChatId}
          onSelectRoom={onSelectRoom}
          onCloseMobile={onCloseMobile}
          meta={roomsMeta[room.id]}
        />
      ))}
    </>
  );

  const renderContent = (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ p: 2.5, pb: 0 }}>
        {!collapseDesktop && (
          <>
            <ChatNavAccount />
            <Stack sx={{ flexGrow: 1 }} />
          </>
        )}

        <Tooltip title="Nhắn tin mới">
          <IconButton onClick={() => setNewChatOpen(true)}>
            <Iconify icon="solar:pen-new-square-bold" />
          </IconButton>
        </Tooltip>

        <IconButton onClick={handleToggleNav}>
          <Iconify
            icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          />
        </IconButton>
      </Stack>

      <Scrollbar sx={{ pb: 1, mt: 2 }}>
        {loading && renderSkeleton}

        {!loading && !!chatRooms.length && renderList}
      </Scrollbar>
    </>
  );

  return (
    <>
      {!mdUp && renderToggleBtn}

      {mdUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderRight: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: NAV_COLLAPSE_WIDTH,
            }),
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
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

      <ChatNewDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectRoom={onSelectRoom}
      />
    </>
  );
}
