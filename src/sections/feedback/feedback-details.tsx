import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
// utils
import { fDateTime } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// locales
import { useLocales } from 'src/locales';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
// api
import { updateFeedback, deleteFeedback } from 'src/api/feedback';
// types
import { IFeedbackItem } from 'src/types/feedback';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['pending', 'reviewed', 'done', 'rejected'];

type Props = {
  feedback: IFeedbackItem | null;
  onMutate: VoidFunction;
  onDelete: VoidFunction;
};

export default function FeedbackDetails({ feedback, onMutate, onDelete }: Props) {
  const { t } = useLocales();

  const { enqueueSnackbar } = useSnackbar();

  const confirmDelete = useBoolean();

  const confirmDeleteReply = useBoolean();

  const isReplying = useBoolean();

  const isEditingReply = useBoolean();

  const [replyText, setReplyText] = useState('');

  const handleSendReply = useCallback(async () => {
    if (!feedback || !replyText.trim()) return;
    try {
      await updateFeedback(feedback.id, { admin_reply: replyText.trim() });
      enqueueSnackbar('Reply sent');
      setReplyText('');
      isReplying.onFalse();
      onMutate();
    } catch (error) {
      enqueueSnackbar('Failed to send reply', { variant: 'error' });
    }
  }, [feedback, replyText, enqueueSnackbar, isReplying, onMutate]);

  const handleUpdateReply = useCallback(async () => {
    if (!feedback || !replyText.trim()) return;
    try {
      await updateFeedback(feedback.id, { admin_reply: replyText.trim() });
      enqueueSnackbar('Reply updated');
      setReplyText('');
      isEditingReply.onFalse();
      onMutate();
    } catch (error) {
      enqueueSnackbar('Failed to update reply', { variant: 'error' });
    }
  }, [feedback, replyText, enqueueSnackbar, isEditingReply, onMutate]);

  const handleDeleteReply = useCallback(async () => {
    if (!feedback) return;
    try {
      await updateFeedback(feedback.id, { admin_reply: null });
      enqueueSnackbar('Reply deleted');
      confirmDeleteReply.onFalse();
      onMutate();
    } catch (error) {
      enqueueSnackbar('Failed to delete reply', { variant: 'error' });
    }
  }, [feedback, enqueueSnackbar, confirmDeleteReply, onMutate]);

  const handleDeleteFeedback = useCallback(async () => {
    if (!feedback) return;
    try {
      await deleteFeedback(feedback.id);
      enqueueSnackbar('Feedback deleted');
      confirmDelete.onFalse();
      onDelete();
    } catch (error) {
      enqueueSnackbar('Failed to delete feedback', { variant: 'error' });
    }
  }, [feedback, enqueueSnackbar, confirmDelete, onDelete]);

  const handleChangeStatus = useCallback(
    async (status: string) => {
      if (!feedback) return;
      try {
        await updateFeedback(feedback.id, { status });
        enqueueSnackbar('Status updated');
        onMutate();
      } catch (error) {
        enqueueSnackbar('Failed to update status', { variant: 'error' });
      }
    },
    [feedback, enqueueSnackbar, onMutate]
  );

  const handleStartEditReply = useCallback(() => {
    if (!feedback) return;
    setReplyText(feedback.admin_reply || '');
    isEditingReply.onTrue();
  }, [feedback, isEditingReply]);

  const handleCancelReply = useCallback(() => {
    setReplyText('');
    isReplying.onFalse();
    isEditingReply.onFalse();
  }, [isReplying, isEditingReply]);

  if (!feedback) {
    return (
      <EmptyContent
        title="No Feedback Selected"
        description="Select a feedback to read"
        imgUrl="/assets/icons/empty/ic_email_selected.svg"
        sx={{
          borderRadius: 1.5,
          bgcolor: 'background.default',
        }}
      />
    );
  }

  const name = feedback.user?.display_name || feedback.email || 'Unknown';

  const renderHead = (
    <Stack direction="row" alignItems="center" flexShrink={0} sx={{ height: 56, pl: 2, pr: 1 }}>
      <Stack direction="row" spacing={1} flexGrow={1} alignItems="center">
        <Select
          size="small"
          value={feedback.status}
          onChange={(e) => handleChangeStatus(e.target.value)}
          sx={{
            typography: 'subtitle2',
            '& .MuiSelect-select': { py: 0.5, px: 1.5 },
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {t(`feedback_status_${status}`)}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Stack direction="row" alignItems="center">
        <Tooltip title="Delete feedback">
          <IconButton onClick={confirmDelete.onTrue} color="error">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );

  const renderSender = (
    <Stack
      flexShrink={0}
      direction="row"
      alignItems="center"
      sx={{
        p: (theme) => theme.spacing(2, 2, 1, 2),
      }}
    >
      <Avatar alt={name} src={feedback.user?.photo_url || ''} sx={{ mr: 2 }}>
        {name.charAt(0).toUpperCase()}
      </Avatar>

      <ListItemText
        primary={name}
        secondary={
          <>
            <Box component="span" sx={{ color: 'text.disabled' }}>
              {feedback.email}
            </Box>
            <Box component="span" sx={{ color: 'text.disabled', ml: 2 }}>
              {fDateTime(feedback.created_at)}
            </Box>
          </>
        }
        secondaryTypographyProps={{
          mt: 0.5,
          noWrap: true,
          component: 'span',
          typography: 'caption',
        }}
      />
    </Stack>
  );

  const renderContent = (
    <Box sx={{ py: 3, overflow: 'hidden', flexGrow: 1 }}>
      <Scrollbar>
        <Typography variant="body2" sx={{ px: 2, whiteSpace: 'pre-wrap' }}>
          {feedback.text}
        </Typography>

        {/* Admin Reply */}
        {feedback.admin_reply && !isEditingReply.value && (
          <Stack sx={{ px: 2, mt: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Admin Reply</Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit reply">
                  <IconButton size="small" onClick={handleStartEditReply}>
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete reply">
                  <IconButton size="small" color="error" onClick={confirmDeleteReply.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {feedback.admin_reply}
              </Typography>
              {feedback.replied_at && (
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
                  {fDateTime(feedback.replied_at)}
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </Scrollbar>
    </Box>
  );

  const renderReplyEditor = (isReplying.value || isEditingReply.value) && (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={6}
        placeholder="Write a reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button variant="outlined" color="inherit" onClick={handleCancelReply}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={isEditingReply.value ? handleUpdateReply : handleSendReply}
          disabled={!replyText.trim()}
          endIcon={<Iconify icon="iconamoon:send-fill" />}
        >
          {isEditingReply.value ? 'Update' : 'Send'}
        </Button>
      </Stack>
    </Stack>
  );

  const renderReplyButton = !feedback.admin_reply && !isReplying.value && (
    <Stack sx={{ p: 2 }}>
      <Button
        variant="soft"
        color="primary"
        startIcon={<Iconify icon="solar:reply-bold" />}
        onClick={isReplying.onTrue}
      >
        Reply
      </Button>
    </Stack>
  );

  return (
    <>
      <Stack
        flexGrow={1}
        sx={{
          width: 1,
          minWidth: 0,
          borderRadius: 1.5,
          bgcolor: 'background.default',
        }}
      >
        {renderHead}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderSender}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderContent}

        {renderReplyButton}

        {renderReplyEditor}
      </Stack>

      {/* Confirm delete feedback */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Feedback"
        content="Are you sure you want to delete this feedback?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteFeedback}>
            Delete
          </Button>
        }
      />

      {/* Confirm delete reply */}
      <ConfirmDialog
        open={confirmDeleteReply.value}
        onClose={confirmDeleteReply.onFalse}
        title="Delete Reply"
        content="Are you sure you want to delete this reply?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteReply}>
            Delete
          </Button>
        }
      />
    </>
  );
}
