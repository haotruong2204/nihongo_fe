import { useState, useCallback } from 'react';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
// routes
import { paths } from 'src/routes/paths';
// api
import {
  useGetUserNotifications,
  createUserNotification,
  updateUserNotification,
  deleteUserNotification,
} from 'src/api/user-notification';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import UserAutocomplete from 'src/components/user-autocomplete';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSkeleton,
} from 'src/components/table';
// utils
import { fDateTime } from 'src/utils/format-time';
// types
import {
  IUserNotificationItem,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  CREATED_BY_OPTIONS,
  CREATED_BY_LABELS,
} from 'src/types/notification';
import { IUserItem } from 'src/types/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user_id', label: 'User ID', width: 80 },
  { id: 'title', label: 'Tiêu đề' },
  { id: 'body', label: 'Nội dung', width: 200 },
  { id: 'notification_type', label: 'Loại', width: 160 },
  { id: 'created_by', label: 'Gửi bởi', width: 100 },
  { id: 'read', label: 'Trạng thái', width: 100 },
  { id: 'created_at', label: 'Ngày tạo', width: 170 },
  { id: '', width: 88 },
];

const EMPTY_FORM = {
  title: '',
  body: '',
  link: '',
  notification_type: 'new_feature' as string,
};

export default function UserNotificationView() {
  const table = useTable({ defaultRowsPerPage: 20 });
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const createDialog = useBoolean();
  const editDialog = useBoolean();
  const confirmDelete = useBoolean();

  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  const [notificationTypeFilter, setNotificationTypeFilter] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);

  const {
    notifications,
    pagination,
    notificationsLoading,
    notificationsEmpty,
    notificationsMutate,
  } = useGetUserNotifications({
    page: table.page + 1,
    perPage: table.rowsPerPage,
    search,
    userId,
    createdBy: createdByFilter,
    notificationType: notificationTypeFilter,
  });

  // Create
  const handleOpenCreate = useCallback(() => {
    setFormData(EMPTY_FORM);
    setSendToAll(false);
    setSelectedUser(null);
    createDialog.onTrue();
  }, [createDialog]);

  const handleCreate = useCallback(async () => {
    if (!formData.title.trim()) return;
    if (!sendToAll && !selectedUser) {
      enqueueSnackbar('Cần chọn user hoặc bật gửi cho tất cả!', { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        body: formData.body || undefined,
        link: formData.link || undefined,
        notification_type: formData.notification_type || undefined,
      };
      if (!sendToAll) {
        payload.user_id = Number(selectedUser!.id);
      }
      await createUserNotification(payload, sendToAll);
      enqueueSnackbar(
        sendToAll ? 'Đã gửi thông báo cho tất cả user!' : 'Tạo thông báo thành công!'
      );
      createDialog.onFalse();
      notificationsMutate();
    } catch (error) {
      enqueueSnackbar('Tạo thông báo thất bại!', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [formData, sendToAll, selectedUser, enqueueSnackbar, createDialog, notificationsMutate]);

  // Edit
  const handleOpenEdit = useCallback(
    (notification: IUserNotificationItem) => {
      setEditingId(notification.id);
      setFormData({
        title: notification.title,
        body: notification.body || '',
        link: notification.link || '',
        notification_type: notification.notification_type || '',
      });
      editDialog.onTrue();
    },
    [editDialog]
  );

  const handleUpdate = useCallback(async () => {
    if (!editingId || !formData.title.trim()) return;
    setSubmitting(true);
    try {
      await updateUserNotification(editingId, {
        title: formData.title,
        body: formData.body,
        link: formData.link,
        notification_type: formData.notification_type,
      });
      enqueueSnackbar('Cập nhật thành công!');
      editDialog.onFalse();
      notificationsMutate();
    } catch (error) {
      enqueueSnackbar('Cập nhật thất bại!', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [editingId, formData, enqueueSnackbar, editDialog, notificationsMutate]);

  // Delete
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
      await deleteUserNotification(deletingId);
      enqueueSnackbar('Xóa thông báo thành công!');
      confirmDelete.onFalse();
      notificationsMutate();
    } catch (error) {
      enqueueSnackbar('Xóa thất bại!', { variant: 'error' });
    }
  }, [deletingId, enqueueSnackbar, confirmDelete, notificationsMutate]);

  // Form
  const handleFieldChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      />
      <TextField
        label="Nội dung"
        value={formData.body}
        onChange={handleFieldChange('body')}
        fullWidth
        multiline
        rows={3}
      />
      <TextField
        label="Link"
        value={formData.link}
        onChange={handleFieldChange('link')}
        fullWidth
        placeholder="/tango/123"
      />
      <TextField
        select
        label="Loại thông báo"
        value={formData.notification_type}
        onChange={handleFieldChange('notification_type')}
        fullWidth
      >
        {NOTIFICATION_TYPES.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Thông báo User"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Thông báo User' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenCreate}
            >
              Gửi thông báo
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

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
              sx={{ width: 220 }}
            />
            <TextField
              size="small"
              placeholder="User ID"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                table.onResetPage();
              }}
              sx={{ width: 120 }}
            />
            <TextField
              select
              size="small"
              label="Gửi bởi"
              value={createdByFilter}
              onChange={(e) => {
                setCreatedByFilter(e.target.value);
                table.onResetPage();
              }}
              sx={{ width: 140 }}
            >
              {CREATED_BY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Loại"
              value={notificationTypeFilter}
              onChange={(e) => {
                setNotificationTypeFilter(e.target.value);
                table.onResetPage();
              }}
              sx={{ width: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {NOTIFICATION_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {notificationsLoading ? (
                    [...Array(table.rowsPerPage)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 56 }} />
                    ))
                  ) : (
                    <>
                      {notifications.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              #{row.user_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" noWrap>
                              {row.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 220,
                              }}
                            >
                              {row.body || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={NOTIFICATION_TYPE_LABELS[row.notification_type] || row.notification_type}
                              size="small"
                              variant="soft"
                              color={NOTIFICATION_TYPE_COLORS[row.notification_type] || 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={CREATED_BY_LABELS[row.created_by] || row.created_by}
                              size="small"
                              variant="soft"
                              color={row.created_by === 'admin' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.read ? 'Đã đọc' : 'Chưa đọc'}
                              size="small"
                              color={row.read ? 'default' : 'info'}
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

                  <TableNoData notFound={notificationsEmpty} />
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
        <DialogTitle>Gửi thông báo cho User</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} sx={{ pt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                />
              }
              label="Gửi cho tất cả user"
            />
            {!sendToAll && (
              <UserAutocomplete
                value={selectedUser}
                onChange={setSelectedUser}
                label="Chọn user *"
              />
            )}
            {renderFormFields}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={createDialog.onFalse}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={submitting || !formData.title.trim()}
          >
            {sendToAll ? 'Gửi tất cả' : 'Gửi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.value} onClose={editDialog.onFalse} fullWidth maxWidth="sm">
        <DialogTitle>Sửa thông báo</DialogTitle>
        <DialogContent>{renderFormFields}</DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={editDialog.onFalse}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={submitting || !formData.title.trim()}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Xóa thông báo"
        content="Bạn có chắc chắn muốn xóa thông báo này?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Xóa
          </Button>
        }
      />
    </>
  );
}
