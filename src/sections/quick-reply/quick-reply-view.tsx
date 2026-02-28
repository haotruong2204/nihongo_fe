import { useRef, useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
// firebase
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from 'src/lib/firebase';
// api
import {
  useGetQuickReplies,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
} from 'src/api/quick-reply';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTable, TableNoData, TableHeadCustom, TableSkeleton } from 'src/components/table';
// utils
import { fDateTime } from 'src/utils/format-time';
// types
import { IQuickReplyItem, IQuickReplyFormData } from 'src/types/quick-reply';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'position', label: 'Vị trí', width: 80 },
  { id: 'title', label: 'Tiêu đề' },
  { id: 'content', label: 'Nội dung', width: 300 },
  { id: 'active', label: 'Hiển thị', width: 120 },
  { id: 'created_at', label: 'Ngày tạo', width: 170 },
  { id: '', width: 88 },
];

const EMPTY_FORM: IQuickReplyFormData = {
  title: '',
  content: '',
  image_url: '',
  position: 0,
  active: true,
};

const ACTIVE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Đang bật' },
  { value: 'false', label: 'Đã tắt' },
];

// ----------------------------------------------------------------------

export default function QuickReplyView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable({ defaultRowsPerPage: 20 });

  // Filters
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const { quickReplies, pagination, quickRepliesLoading, quickRepliesEmpty, quickRepliesMutate } =
    useGetQuickReplies({
      page: table.page + 1,
      perPage: table.rowsPerPage,
      search,
      active: activeFilter,
    });

  // Dialog states
  const createDialog = useBoolean();
  const editDialog = useBoolean();
  const confirmDelete = useBoolean();

  const [formData, setFormData] = useState<IQuickReplyFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkDialog = useBoolean();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ---------- Insert link ----------
  const handleInsertLink = useCallback(() => {
    if (!linkUrl.trim()) return;
    const textarea = contentRef.current;
    const url = linkUrl.trim();

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = formData.content.substring(0, start);
      const after = formData.content.substring(end);
      setFormData((prev) => ({ ...prev, content: `${before}${url}${after}` }));
    } else {
      setFormData((prev) => ({
        ...prev,
        content: prev.content ? `${prev.content}\n${url}` : url,
      }));
    }

    setLinkUrl('');
    linkDialog.onFalse();
  }, [linkUrl, formData.content, linkDialog]);

  // ---------- Image upload ----------
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const path = `chats/quick_replies/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        // Insert URL at cursor position in content
        const textarea = contentRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = formData.content.substring(0, start);
          const after = formData.content.substring(end);
          setFormData((prev) => ({ ...prev, content: `${before}${url}${after}`, image_url: url }));
        } else {
          setFormData((prev) => ({
            ...prev,
            content: prev.content ? `${prev.content}\n${url}` : url,
            image_url: url,
          }));
        }
        setImagePreview(url);
      } catch (error) {
        enqueueSnackbar('Upload ảnh thất bại!', { variant: 'error' });
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [enqueueSnackbar, formData.content]
  );

  const handleRemoveImage = useCallback(() => {
    const url = formData.image_url;
    setFormData((prev) => ({
      ...prev,
      image_url: '',
      content: url ? prev.content.replace(url, '').trim() : prev.content,
    }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [formData.image_url]);

  // ---------- Create ----------
  const handleOpenCreate = useCallback(() => {
    setFormData(EMPTY_FORM);
    setImagePreview(null);
    createDialog.onTrue();
  }, [createDialog]);

  const handleCreate = useCallback(async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    try {
      await createQuickReply(formData);
      enqueueSnackbar('Tạo quick reply thành công!');
      createDialog.onFalse();
      quickRepliesMutate();
    } catch (error) {
      enqueueSnackbar('Tạo quick reply thất bại!', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [formData, enqueueSnackbar, createDialog, quickRepliesMutate]);

  // ---------- Edit ----------
  const handleOpenEdit = useCallback(
    (item: IQuickReplyItem) => {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        content: item.content,
        image_url: item.image_url || '',
        position: item.position,
        active: item.active,
      });
      setImagePreview(item.image_url || null);
      editDialog.onTrue();
    },
    [editDialog]
  );

  const handleUpdate = useCallback(async () => {
    if (!editingId || !formData.title.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    try {
      await updateQuickReply(editingId, formData);
      enqueueSnackbar('Cập nhật thành công!');
      editDialog.onFalse();
      quickRepliesMutate();
    } catch (error) {
      enqueueSnackbar('Cập nhật thất bại!', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [editingId, formData, enqueueSnackbar, editDialog, quickRepliesMutate]);

  // ---------- Delete ----------
  const handleOpenDelete = useCallback(
    (id: string) => {
      setDeletingId(id);
      confirmDelete.onTrue();
    },
    [confirmDelete]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteQuickReply(deletingId);
      enqueueSnackbar('Xóa quick reply thành công!');
      confirmDelete.onFalse();
      quickRepliesMutate();
    } catch (error) {
      enqueueSnackbar('Xóa thất bại!', { variant: 'error' });
    }
  }, [deletingId, enqueueSnackbar, confirmDelete, quickRepliesMutate]);

  // ---------- Form ----------
  const handleFieldChange = useCallback(
    (field: keyof IQuickReplyFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const renderFormFields = (
    <Box display="grid" gap={2} sx={{ pt: 1 }}>
      <TextField
        label="Tiêu đề *"
        value={formData.title}
        onChange={handleFieldChange('title')}
        fullWidth
        placeholder="VD: Giá khóa học"
      />
      <TextField
        label="Nội dung *"
        value={formData.content}
        onChange={handleFieldChange('content')}
        fullWidth
        multiline
        rows={4}
        placeholder="Nội dung trả lời khi user chọn quick reply này"
        inputRef={contentRef}
      />
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:link-bold" width={18} />}
          onClick={() => {
            setLinkUrl('');
            linkDialog.onTrue();
          }}
        >
          Chèn link
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={
            uploading ? (
              <CircularProgress size={16} />
            ) : (
              <Iconify icon="solar:gallery-bold" width={18} />
            )
          }
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Đang tải...' : 'Thêm ảnh'}
        </Button>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {imagePreview && (
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Box
            component="img"
            src={imagePreview}
            sx={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <IconButton size="small" color="error" onClick={handleRemoveImage}>
            <Iconify icon="mingcute:close-line" width={18} />
          </IconButton>
        </Stack>
      )}

      <TextField
        label="Vị trí"
        type="number"
        value={formData.position}
        onChange={(e) => setFormData((prev) => ({ ...prev, position: Number(e.target.value) }))}
        fullWidth
      />
      <FormControlLabel
        control={
          <Switch
            checked={formData.active}
            onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
          />
        }
        label="Hiển thị cho user"
      />
    </Box>
  );

  // ==================== RENDER ====================

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Tin nhắn nhanh</Typography>

          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenCreate}
          >
            Tạo mới
          </Button>
        </Stack>

        <Card>
          {/* Filters */}
          <Stack direction="row" spacing={2} sx={{ p: 2.5, pb: 0 }} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Tìm theo tiêu đề..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                table.onResetPage();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            <TextField
              select
              size="small"
              label="Hiển thị"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                table.onResetPage();
              }}
              sx={{ width: 150 }}
            >
              {ACTIVE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {quickRepliesLoading ? (
                    [...Array(table.rowsPerPage)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 56 }} />
                    ))
                  ) : (
                    <>
                      {quickReplies.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Typography variant="body2">{row.position}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" noWrap>
                              {row.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {row.image_url && (
                                <Box
                                  component="img"
                                  src={row.image_url}
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    objectFit: 'cover',
                                    borderRadius: 0.5,
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 260,
                                }}
                              >
                                {row.content}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.active ? 'Admin & người dùng' : 'Chỉ admin'}
                              size="small"
                              color={row.active ? 'success' : 'default'}
                              variant="soft"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {fDateTime(row.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="Sửa">
                                <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                                  <Iconify icon="solar:pen-bold" width={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDelete(row.id)}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}

                  <TableNoData notFound={quickRepliesEmpty} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination.total_count}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>
      </Container>

      {/* Create Dialog */}
      <Dialog open={createDialog.value} onClose={createDialog.onFalse} fullWidth maxWidth="sm">
        <DialogTitle>Tạo Quick Reply mới</DialogTitle>
        <DialogContent>{renderFormFields}</DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={createDialog.onFalse}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={submitting || !formData.title.trim() || !formData.content.trim()}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.value} onClose={editDialog.onFalse} fullWidth maxWidth="sm">
        <DialogTitle>Sửa Quick Reply</DialogTitle>
        <DialogContent>{renderFormFields}</DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={editDialog.onFalse}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={submitting || !formData.title.trim() || !formData.content.trim()}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Xóa Quick Reply"
        content="Bạn có chắc chắn muốn xóa quick reply này?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Xóa
          </Button>
        }
      />

      {/* Insert Link Dialog */}
      <Dialog open={linkDialog.value} onClose={linkDialog.onFalse} fullWidth maxWidth="xs">
        <DialogTitle>Chèn link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            fullWidth
            placeholder="https://example.com"
            sx={{ mt: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInsertLink();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={linkDialog.onFalse}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleInsertLink} disabled={!linkUrl.trim()}>
            Chèn
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
