import { useState, useEffect, useCallback, useRef } from 'react';
// @mui
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
// api
import axios, { endpoints } from 'src/utils/axios';
import { createNewChat } from 'src/api/chat';
// components
import Iconify from 'src/components/iconify';
// types
import { IChatRoomMetaUser } from 'src/types/chat';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
};

export default function ChatNewDialog({ open, onClose, onSelectRoom }: Props) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<IChatRoomMetaUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await axios.get(endpoints.user.list, {
        params: {
          'q[email_cont]': q,
          per_page: 20,
        },
      });
      const items = res.data?.data?.resource?.data || [];
      const mapped: IChatRoomMetaUser[] = items.map((item: any) => item.attributes);
      setUsers(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setUsers([]);
      return;
    }
    // Load initial users
    fetchUsers('');
  }, [open, fetchUsers]);

  useEffect(() => {
    if (!open) return undefined;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, open, fetchUsers]);

  const handleSelectUser = useCallback(
    async (user: IChatRoomMetaUser) => {
      if (creating) return;
      setCreating(true);
      try {
        const chatId = await createNewChat({
          uid: user.uid,
          display_name: user.display_name,
          photo_url: user.photo_url,
        });
        onClose();
        onSelectRoom(chatId);
      } catch (error) {
        console.error(error);
      } finally {
        setCreating(false);
      }
    },
    [creating, onClose, onSelectRoom]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nhắn tin mới</DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <TextField
          fullWidth
          placeholder="Tìm theo email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ px: 3, py: 2 }}
        />

        {loading && (
          <Typography variant="body2" sx={{ px: 3, py: 2, color: 'text.secondary' }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            Loading...
          </Typography>
        )}

        <List sx={{ maxHeight: 320, overflow: 'auto' }}>
          {users.map((u) => (
            <ListItemButton
              key={u.id}
              onClick={() => handleSelectUser(u)}
              disabled={creating}
            >
              <ListItemAvatar>
                <Avatar src={u.photo_url} alt={u.display_name}>
                  {u.display_name?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={u.display_name}
                secondary={u.email}
                primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
              />
            </ListItemButton>
          ))}

          {!loading && users.length === 0 && (
            <Typography variant="body2" sx={{ px: 3, py: 2, color: 'text.secondary' }}>
              Không tìm thấy user
            </Typography>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}
