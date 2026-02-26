import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useRouter } from 'src/routes/hooks';
// api
import {
  useGetNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createAdminNotification,
  updateAdminNotification,
  deleteAdminNotification,
} from 'src/api/notification';
import {
  useGetUserNotifications,
  createUserNotification,
  updateUserNotification,
  deleteUserNotification,
} from 'src/api/user-notification';
// components
import { useSettingsContext } from 'src/components/settings';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import UserAutocomplete from 'src/components/user-autocomplete';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSkeleton,
} from 'src/components/table';
// utils
import { fToNow, fDateTime } from 'src/utils/format-time';
// types
import {
  INotificationItem,
  IUserNotificationItem,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_COLORS,
  CREATED_BY_OPTIONS,
  CREATED_BY_LABELS,
} from 'src/types/notification';
import { IUserItem } from 'src/types/user';

// ----------------------------------------------------------------------

const EMPTY_FORM = { title: '', body: '', link: '', notification_type: '' };

const USER_NOTI_TABLE_HEAD = [
  { id: 'user_id', label: 'User', width: 180 },
  { id: 'title', label: 'Tiêu đề' },
  { id: 'body', label: 'Nội dung', width: 200 },
  { id: 'notification_type', label: 'Loại', width: 160 },
  { id: 'created_by', label: 'Gửi bởi', width: 100 },
  { id: 'read', label: 'Trạng thái', width: 100 },
  { id: 'created_at', label: 'Ngày tạo', width: 170 },
  { id: '', width: 88 },
];

export default function NotificationsView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // Tab
  const [currentTab, setCurrentTab] = useState(0);

  // ---------- Admin notifications ----------
  const [adminCreatedByFilter, setAdminCreatedByFilter] = useState('');
  const [adminTypeFilter, setAdminTypeFilter] = useState('');

  const {
    notifications: adminNotifications,
    unreadCount,
    notificationsLoading: adminLoading,
    notificationsMutate: adminMutate,
  } = useGetNotifications({
    createdBy: adminCreatedByFilter,
    notificationType: adminTypeFilter,
  });

  // ---------- User notifications ----------
  const userTable = useTable({ defaultRowsPerPage: 20 });
  const [userSearch, setUserSearch] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [userCreatedByFilter, setUserCreatedByFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');

  const {
    notifications: userNotifications,
    pagination: userPagination,
    notificationsLoading: userLoading,
    notificationsEmpty: userEmpty,
    notificationsMutate: userMutate,
  } = useGetUserNotifications({
    page: userTable.page + 1,
    perPage: userTable.rowsPerPage,
    search: userSearch,
    userId: userIdFilter,
    createdBy: userCreatedByFilter,
    notificationType: userTypeFilter,
  });

  // ---------- Shared dialog states ----------
  const createDialog = useBoolean();
  const editDialog = useBoolean();
  const confirmDelete = useBoolean();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'admin' | 'user'>('admin');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<'admin' | 'user'>('admin');
  const [submitting, setSubmitting] = useState(false);

  // Create target
  const [createTarget, setCreateTarget] = useState<'admin' | 'user'>('admin');
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);
  const [sendToAll, setSendToAll] = useState(false);

  // ---------- Admin: click to read ----------
  const handleAdminClick = useCallback(
    async (notification: INotificationItem) => {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        adminMutate();
      }
      if (notification.link) {
        router.push(`/dashboard${notification.link}`);
      }
    },
    [router, adminMutate]
  );

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    adminMutate();
  }, [adminMutate]);

  // ---------- Create ----------
  const handleOpenCreate = useCallback(() => {
    setFormData(EMPTY_FORM);
    setCreateTarget(currentTab === 0 ? 'admin' : 'user');
    setSelectedUser(null);
    setSendToAll(false);
    createDialog.onTrue();
  }, [createDialog, currentTab]);

  const handleCreate = useCallback(async () => {
    if (!formData.title.trim()) return;
    if (createTarget === 'user' && !sendToAll && !selectedUser) {
      enqueueSnackbar('Cần chọn user hoặc bật gửi cho tất cả!', { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      if (createTarget === 'user') {
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
          sendToAll ? 'Đã gửi thông báo cho tất cả user!' : 'Đã gửi thông báo cho user!'
        );
        createDialog.onFalse();
        setCurrentTab(1);
        userMutate();
      } else {
        await createAdminNotification(formData);
        enqueueSnackbar('Tạo thông báo admin thành công!');
        createDialog.onFalse();
        setCurrentTab(0);
        adminMutate();
      }
    } catch (error) {
      enqueueSnackbar('Tạo thông báo thất bại!', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [formData, createTarget, selectedUser, sendToAll, enqueueSnackbar, createDialog, adminMutate, userMutate]);

  // ---------- Edit ----------
  const handleOpenEditAdmin = useCallback(
    (notification: INotificationItem) => {
      setEditingId(notification.id);
      setEditingType('admin');
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

  const handleOpenEditUser = useCallback(
    (notification: IUserNotificationItem) => {
      setEditingId(notification.id);
      setEditingType('user');
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
      if (editingType === 'user') {
        await updateUserNotification(editingId, formData);
        userMutate();
      } else {
        await updateAdminNotification(editingId, formData);
        adminMutate();
      }
      enqueueSnackbar('Cập nhật thành công!');
      editDialog.onFalse();
    } catch (error) {
      enqueueSnackbar('Cập nhật thất bại!', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [editingId, editingType, formData, enqueueSnackbar, editDialog, adminMutate, userMutate]);

  // ---------- Delete ----------
  const handleOpenDeleteAdmin = useCallback(
    (id: string) => {
      setDeletingId(id);
      setDeletingType('admin');
      confirmDelete.onTrue();
    },
    [confirmDelete]
  );

  const handleOpenDeleteUser = useCallback(
    (id: string) => {
      setDeletingId(id);
      setDeletingType('user');
      confirmDelete.onTrue();
    },
    [confirmDelete]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      if (deletingType === 'user') {
        await deleteUserNotification(deletingId);
        userMutate();
      } else {
        await deleteAdminNotification(deletingId);
        adminMutate();
      }
      enqueueSnackbar('Xóa thông báo thành công!');
      confirmDelete.onFalse();
    } catch (error) {
      enqueueSnackbar('Xóa thất bại!', { variant: 'error' });
    }
  }, [deletingId, deletingType, enqueueSnackbar, confirmDelete, adminMutate, userMutate]);

  // ---------- Form ----------
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
        placeholder="/feedback?id=1"
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

  // ==================== RENDER ====================

  const renderAdminTab = (
    <>
      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Gửi bởi"
          value={adminCreatedByFilter}
          onChange={(e) => setAdminCreatedByFilter(e.target.value)}
          sx={{ width: 150 }}
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
          value={adminTypeFilter}
          onChange={(e) => setAdminTypeFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {NOTIFICATION_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {adminLoading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!adminLoading && adminNotifications.length === 0 && (
        <EmptyContent title="Chưa có thông báo nào" />
      )}

      {!adminLoading && adminNotifications.length > 0 && (
        <Card>
          {adminNotifications.map((notification) => (
            <ListItemButton
              key={notification.id}
              sx={{
                py: 1.5,
                px: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                ...(!notification.read && {
                  bgcolor: 'action.selected',
                }),
              }}
            >
              <Tooltip title={NOTIFICATION_TYPE_LABELS[notification.notification_type] || notification.notification_type}>
                <Box
                  sx={{ mr: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleAdminClick(notification)}
                >
                  <Iconify
                    icon={NOTIFICATION_TYPE_ICONS[notification.notification_type] || 'solar:bell-bold'}
                    width={24}
                    sx={{
                      color: (() => {
                        if (notification.read) return 'text.disabled';
                        if (notification.notification_type === 'warning') return 'error.main';
                        return 'primary.main';
                      })(),
                    }}
                  />
                </Box>
              </Tooltip>

              <ListItemText
                onClick={() => handleAdminClick(notification)}
                sx={{ cursor: 'pointer' }}
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: notification.read ? 'text.secondary' : 'text.primary' }}>
                      {notification.title}
                    </Typography>
                    <Chip
                      label={NOTIFICATION_TYPE_LABELS[notification.notification_type] || notification.notification_type}
                      size="small"
                      variant="soft"
                      color={NOTIFICATION_TYPE_COLORS[notification.notification_type] || 'default'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={CREATED_BY_LABELS[notification.created_by] || notification.created_by}
                      size="small"
                      variant="soft"
                      color={notification.created_by === 'admin' ? 'warning' : 'default'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Stack>
                }
                secondary={
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {fToNow(notification.created_at)}
                    </Typography>
                    {notification.body && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 300,
                        }}
                      >
                        — {notification.body}
                      </Typography>
                    )}
                  </Stack>
                }
              />

              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                <Tooltip title="Sửa">
                  <IconButton size="small" onClick={() => handleOpenEditAdmin(notification)}>
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleOpenDeleteAdmin(notification.id)}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </Tooltip>

                {!notification.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      ml: 0.5,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Stack>
            </ListItemButton>
          ))}
        </Card>
      )}
    </>
  );

  const renderUserTab = (
    <Card>
      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ p: 2.5, pb: 0 }} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Tìm theo tiêu đề..."
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            userTable.onResetPage();
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
          value={userIdFilter}
          onChange={(e) => {
            setUserIdFilter(e.target.value);
            userTable.onResetPage();
          }}
          sx={{ width: 120 }}
        />
        <TextField
          select
          size="small"
          label="Gửi bởi"
          value={userCreatedByFilter}
          onChange={(e) => {
            setUserCreatedByFilter(e.target.value);
            userTable.onResetPage();
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
          value={userTypeFilter}
          onChange={(e) => {
            setUserTypeFilter(e.target.value);
            userTable.onResetPage();
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
          <Table size={userTable.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
            <TableHeadCustom headLabel={USER_NOTI_TABLE_HEAD} />

            <TableBody>
              {userLoading ? (
                [...Array(userTable.rowsPerPage)].map((_, index) => (
                  <TableSkeleton key={index} sx={{ height: 56 }} />
                ))
              ) : (
                <>
                  {userNotifications.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2" noWrap>
                            {row.user_display_name || `User #${row.user_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {row.user_email || `#${row.user_id}`}
                          </Typography>
                        </Stack>
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
                            <IconButton size="small" onClick={() => handleOpenEditUser(row)}>
                              <Iconify icon="solar:pen-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteUser(row.id)}
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

              <TableNoData notFound={userEmpty} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePagination
        component="div"
        count={userPagination.total_count}
        page={userTable.page}
        rowsPerPage={userTable.rowsPerPage}
        onPageChange={userTable.onChangePage}
        onRowsPerPageChange={userTable.onChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Card>
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">
            Thông báo
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="error"
                size="small"
                sx={{ ml: 1, fontWeight: 'bold' }}
              />
            )}
          </Typography>

          <Stack direction="row" spacing={1}>
            {currentTab === 0 && unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<Iconify icon="eva:done-all-fill" />}
                onClick={handleMarkAllRead}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenCreate}
            >
              Tạo thông báo
            </Button>
          </Stack>
        </Stack>

        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Admin" iconPosition="end" icon={
            <Chip label={adminNotifications.length} size="small" variant="soft" color="default" sx={{ ml: 1 }} />
          } />
          <Tab label="User" iconPosition="end" icon={
            <Chip label={userPagination.total_count} size="small" variant="soft" color="default" sx={{ ml: 1 }} />
          } />
        </Tabs>

        {currentTab === 0 && renderAdminTab}
        {currentTab === 1 && renderUserTab}
      </Container>

      {/* Create Dialog */}
      <Dialog
        open={createDialog.value}
        onClose={createDialog.onFalse}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tạo thông báo mới</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Gửi đến"
              value={createTarget}
              onChange={(e) => setCreateTarget(e.target.value as 'admin' | 'user')}
              fullWidth
            >
              <MenuItem value="admin">Admin (hiển thị trên dashboard)</MenuItem>
              <MenuItem value="user">User (gửi đến user)</MenuItem>
            </TextField>

            {createTarget === 'user' && (
              <>
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
              </>
            )}
          </Box>
          {renderFormFields}
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
            {(() => {
              if (createTarget !== 'user') return 'Tạo';
              return sendToAll ? 'Gửi tất cả' : 'Gửi';
            })()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.value}
        onClose={editDialog.onFalse}
        fullWidth
        maxWidth="sm"
      >
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
