// types
import { IChatMessage } from 'src/types/chat';

// ----------------------------------------------------------------------

type Props = {
  message: IChatMessage;
  adminId: string;
};

export default function useGetMessage({ message, adminId }: Props) {
  const me = message.senderId === adminId;

  const senderDetails = me
    ? { type: 'me' as const }
    : {
        firstName: message.senderName,
      };

  return {
    me,
    senderDetails,
  };
}
