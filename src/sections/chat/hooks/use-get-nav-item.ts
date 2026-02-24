// types
import { IChatRoom } from 'src/types/chat';

// ----------------------------------------------------------------------

type Props = {
  room: IChatRoom;
  adminId: string;
};

export default function useGetNavItem({ room, adminId }: Props) {
  const displayName = room.participantName;

  const displayText = room.lastMessage || '';

  const lastActivity = room.lastMessageAt?.toDate() || null;

  return {
    displayName,
    displayText,
    lastActivity,
  };
}
