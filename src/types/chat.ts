import { Timestamp } from 'firebase/firestore';

// ----------------------------------------------------------------------

export type IChatRoomMetaUser = {
  id: number;
  uid: string;
  email: string;
  display_name: string;
  photo_url: string;
  is_premium: boolean;
  premium_until: string | null;
  is_banned: boolean;
  banned_reason: string | null;
  last_login_at: string | null;
  created_at: string | null;
};

export type IChatRoomMeta = {
  id: string;
  uid: string;
  status: string;
  chat_banned: boolean;
  chat_ban_reason: string | null;
  last_admin_reply_at: string | null;
  last_user_message_at: string | null;
  last_opened_at: string | null;
  admin_note: string | null;
  user: IChatRoomMetaUser | null;
};

// ----------------------------------------------------------------------

export type IChatRoom = {
  id: string; // = userId
  participantId: string;
  participantName: string;
  participantPhoto: string;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  adminUnread: number;
  userUnread: number;
  chatBanned?: boolean;
  chatBanReason?: string;
};

export type IChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Timestamp | null;
  imageUrl?: string;
};
