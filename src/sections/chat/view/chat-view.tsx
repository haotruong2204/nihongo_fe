import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
// auth
import { useAuthContext } from 'src/auth/hooks';
// api
import { useChatRooms, useChatMessages, resetAdminUnread, fetchChatRoomsMeta, updateChatRoomMeta } from 'src/api/chat';
import { usePresenceChannel } from 'src/api/presence';
// types
import { IChatRoomMeta } from 'src/types/chat';
// components
import { useSettingsContext } from 'src/components/settings';
//
import ChatNav from '../chat-nav';
import ChatRoom from '../chat-room';
import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderDetail from '../chat-header-detail';

// ----------------------------------------------------------------------

export default function ChatView() {
  const router = useRouter();

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const searchParams = useSearchParams();

  const selectedChatId = searchParams.get('id') || '';

  const { chatRooms, loading } = useChatRooms();

  const { messages } = useChatMessages(selectedChatId || null);

  const selectedRoom = chatRooms.find((room) => room.id === selectedChatId) || null;

  const adminId = user ? `admin_${user.id}` : '';

  // Rails enriched metadata
  const [roomsMeta, setRoomsMeta] = useState<Record<string, IChatRoomMeta>>({});

  const roomUidsKey = useMemo(() => chatRooms.map((r) => r.id).join(','), [chatRooms]);

  useEffect(() => {
    const uids = chatRooms.map((r) => r.id);
    if (uids.length === 0) return;
    fetchChatRoomsMeta(uids).then(setRoomsMeta).catch(console.error);
  }, [roomUidsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Online presence tracking
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Initialize online state from meta
  useEffect(() => {
    const ids = new Set<string>();
    Object.values(roomsMeta).forEach((meta) => {
      if (meta.user?.is_online) {
        ids.add(String(meta.user.id));
        if (meta.user.uid) ids.add(String(meta.user.uid));
      }
    });
    setOnlineUserIds(ids);
  }, [roomsMeta]);

  // Real-time presence updates via WebSocket
  const chatRoomsRef = useRef(chatRooms);
  chatRoomsRef.current = chatRooms;

  const handlePresenceChange = useCallback((data: { user_id: string; is_online: boolean }) => {
    setOnlineUserIds((prev) => {
      const next = new Set(prev);
      if (data.is_online) {
        next.add(String(data.user_id));
      } else {
        next.delete(String(data.user_id));
      }
      return next;
    });
    // Also refetch meta for reliable is_online state
    const uids = chatRoomsRef.current.map((r) => r.id);
    if (uids.length > 0) {
      fetchChatRoomsMeta(uids).then(setRoomsMeta).catch(console.error);
    }
  }, []);

  usePresenceChannel({ onPresenceChange: handlePresenceChange });

  const selectedMeta = selectedChatId ? roomsMeta[selectedChatId] : undefined;

  // Reset admin unread when selecting a room
  useEffect(() => {
    if (selectedChatId && selectedRoom && selectedRoom.adminUnread > 0) {
      resetAdminUnread(selectedChatId);
    }
  }, [selectedChatId, selectedRoom]);

  // Track last_opened_at when selecting a room
  useEffect(() => {
    if (selectedChatId) {
      updateChatRoomMeta(selectedChatId, { last_opened_at: new Date().toISOString() }).catch(console.error);
    }
  }, [selectedChatId]);

  const handleSelectRoom = useCallback(
    (roomId: string) => {
      router.push(`${paths.dashboard.chat}?id=${roomId}`);
    },
    [router]
  );

  const handleMessageSent = useCallback(() => {
    if (selectedChatId) {
      updateChatRoomMeta(selectedChatId, { last_admin_reply_at: new Date().toISOString() }).catch(console.error);
    }
  }, [selectedChatId]);

  const handleMetaUpdate = useCallback(() => {
    const uids = chatRooms.map((r) => r.id);
    if (uids.length === 0) return;
    fetchChatRoomsMeta(uids).then(setRoomsMeta).catch(console.error);
  }, [chatRooms]);

  const handleDeleteChat = useCallback(() => {
    router.push(paths.dashboard.chat);
  }, [router]);

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
    >
      {selectedRoom && <ChatHeaderDetail room={selectedRoom} meta={selectedMeta} />}
    </Stack>
  );

  const renderNav = (
    <ChatNav
      chatRooms={chatRooms}
      loading={loading}
      selectedChatId={selectedChatId}
      onSelectRoom={handleSelectRoom}
      roomsMeta={roomsMeta}
      onlineUserIds={onlineUserIds}
    />
  );

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <ChatMessageList
        messages={messages}
        adminId={adminId}
        participantPhoto={selectedMeta?.user?.photo_url || selectedRoom?.participantPhoto}
        room={selectedRoom}
      />

      <ChatMessageInput
        chatId={selectedChatId}
        disabled={!selectedChatId}
        onMessageSent={handleMessageSent}
      />
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Chat
      </Typography>

      <Stack component={Card} direction="row" sx={{ height: '72vh' }}>
        {renderNav}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          {renderHead}

          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: 'hidden',
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {renderMessages}

            {selectedRoom && <ChatRoom room={selectedRoom} meta={selectedMeta} onMetaUpdate={handleMetaUpdate} onDelete={handleDeleteChat} />}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
