import { useRef, useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
// emoji
// eslint-disable-next-line import/no-extraneous-dependencies
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
// auth
import { useAuthContext } from 'src/auth/hooks';
// api
import { sendAdminMessage, uploadChatImage } from 'src/api/chat';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  chatId: string;
  disabled: boolean;
  onMessageSent?: () => void;
};

export default function ChatMessageInput({ chatId, disabled, onMessageSent }: Props) {
  const { user } = useAuthContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const messageRef = useRef(message);
  messageRef.current = message;

  const sendingRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageFileRef = useRef(imageFile);
  imageFileRef.current = imageFile;

  // Emoji popover
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const doSend = useCallback(async () => {
    const currentMessage = messageRef.current;
    const currentImageFile = imageFileRef.current;

    if ((!currentMessage.trim() && !currentImageFile) || !chatId || !user || sendingRef.current) return;
    sendingRef.current = true;
    setUploading(!!currentImageFile);

    const text = currentMessage.trim();
    setMessage('');

    try {
      let imageUrl: string | undefined;
      if (currentImageFile) {
        imageUrl = await uploadChatImage(chatId, currentImageFile);
      }
      await sendAdminMessage(chatId, text, { id: user.id, email: user.email }, imageUrl);
      clearImage();
      onMessageSent?.();
    } catch (error) {
      console.error(error);
    } finally {
      sendingRef.current = false;
      setUploading(false);
      inputRef.current?.focus();
    }
  }, [chatId, user, onMessageSent, clearImage]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        doSend();
      }
    },
    [doSend]
  );

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setEmojiAnchor(null);
    inputRef.current?.focus();
  }, []);

  const canSend = !disabled && !uploading && (!!message.trim() || !!imageFile);

  return (
    <Box>
      {/* Image preview */}
      {imagePreview && (
        <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1, gap: 1 }}>
          <Box
            component="img"
            src={imagePreview}
            sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
          />
          <IconButton size="small" onClick={clearImage}>
            <Iconify icon="mingcute:close-line" width={18} />
          </IconButton>
        </Stack>
      )}

      <Stack
        direction="row"
        alignItems="flex-end"
        sx={{
          px: 1,
          minHeight: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" sx={{ flexShrink: 0, py: 1 }}>
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Iconify icon="solar:gallery-bold" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => setEmojiAnchor(e.currentTarget)}
            disabled={disabled || uploading}
          >
            <Iconify icon="eva:smiling-face-fill" />
          </IconButton>
        </Stack>

        <InputBase
          fullWidth
          multiline
          maxRows={4}
          inputRef={inputRef}
          value={message}
          onKeyDown={handleKeyDown}
          onChange={handleChangeMessage}
          placeholder="Type a message"
          disabled={disabled || uploading}
          sx={{ py: 1.5 }}
        />

        <Stack direction="row" sx={{ flexShrink: 0, py: 1 }}>
          {uploading ? (
            <CircularProgress size={24} sx={{ m: 1 }} />
          ) : (
            <IconButton onClick={doSend} disabled={!canSend}>
              <Iconify icon="ic:round-send" />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Emoji picker popover */}
      <Popover
        open={!!emojiAnchor}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
    </Box>
  );
}
