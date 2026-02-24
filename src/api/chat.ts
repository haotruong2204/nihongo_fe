import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from 'src/lib/firebase';
import { IChatRoom, IChatMessage, IChatRoomMeta } from 'src/types/chat';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useChatRooms() {
  const [chatRooms, setChatRooms] = useState<IChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('lastMessageAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IChatRoom[];

      setChatRooms(rooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { chatRooms, loading };
}

// ----------------------------------------------------------------------

export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<IChatMessage[]>([]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return undefined;
    }

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IChatMessage[];

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  return { messages };
}

// ----------------------------------------------------------------------

export async function uploadChatImage(chatId: string, file: File): Promise<string> {
  const path = `chats/${chatId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function sendAdminMessage(
  chatId: string,
  text: string,
  admin: { id: string; email: string },
  imageUrl?: string
) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const chatRef = doc(db, 'chats', chatId);

  await Promise.all([
    addDoc(messagesRef, {
      text,
      senderId: `admin_${admin.id}`,
      senderName: admin.email,
      createdAt: serverTimestamp(),
      ...(imageUrl && { imageUrl }),
    }),
    updateDoc(chatRef, {
      lastMessage: text || '[Hình ảnh]',
      lastMessageAt: serverTimestamp(),
      userUnread: increment(1),
    }),
  ]);
}

// ----------------------------------------------------------------------

export async function resetAdminUnread(chatId: string) {
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, { adminUnread: 0 });
}

// ----------------------------------------------------------------------

export function useTotalAdminUnread() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'chats'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((d) => {
        total += d.data().adminUnread || 0;
      });
      setCount(total);
    });

    return () => unsubscribe();
  }, []);

  return count;
}

// ----------------------------------------------------------------------
// Rails API — enriched room metadata
// ----------------------------------------------------------------------

export async function fetchChatRoomsMeta(uids: string[]): Promise<Record<string, IChatRoomMeta>> {
  const params = new URLSearchParams();
  uids.forEach((uid) => params.append('uids[]', uid));
  const res = await axios.get(endpoints.chatRoom.list, { params });
  console.log('[fetchChatRoomsMeta] raw response:', JSON.stringify(res.data));
  const items = res.data?.data?.resource?.data || [];
  console.log('[fetchChatRoomsMeta] items:', JSON.stringify(items));
  const map: Record<string, IChatRoomMeta> = {};
  items.forEach((item: any) => {
    const attrs = item.attributes;
    map[attrs.uid] = attrs;
  });
  return map;
}

export async function updateChatRoomMeta(uid: string, data: Record<string, any>) {
  return axios.patch(endpoints.chatRoom.update(uid), { chat_room: data });
}

export async function deleteChatRoom(chatId: string) {
  // Delete all messages in subcollection first
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const snapshot = await getDocs(messagesRef);
  const deletes = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);

  // Delete the chat document
  await deleteDoc(doc(db, 'chats', chatId));
}

// ----------------------------------------------------------------------

export async function createNewChat(user: {
  uid: string;
  display_name: string;
  photo_url: string;
}) {
  const chatRef = doc(db, 'chats', user.uid);
  await setDoc(
    chatRef,
    {
      participantId: user.uid,
      participantName: user.display_name,
      participantPhoto: user.photo_url,
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      adminUnread: 0,
      userUnread: 0,
    },
    { merge: true }
  );
  return user.uid;
}
