// ----------------------------------------------------------------------

// Notification type enum constants
export const NOTIFICATION_TYPES = [
  { value: 'feedback', label: 'Phản hồi' },
  { value: 'new_feature', label: 'Tính năng mới!' },
  { value: 'upgrade_success', label: 'Nâng cấp' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'welcome', label: 'Chào mừng' },
  { value: 'warning', label: 'Cảnh báo' },
] as const;

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  feedback: 'Phản hồi',
  new_feature: 'Tính năng mới!',
  upgrade_success: 'Nâng cấp',
  maintenance: 'Bảo trì',
  welcome: 'Chào mừng',
  warning: 'Cảnh báo',
};

// Icon mapping (Iconify icons) for each notification type
export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  feedback: 'solar:chat-round-dots-bold',
  new_feature: 'solar:star-bold',
  upgrade_success: 'solar:crown-bold',
  maintenance: 'solar:settings-bold',
  welcome: 'solar:hand-shake-bold',
  warning: 'solar:danger-triangle-bold',
};

// Color mapping for notification type chips
export const NOTIFICATION_TYPE_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'
> = {
  feedback: 'info',
  new_feature: 'primary',
  upgrade_success: 'success',
  maintenance: 'secondary',
  welcome: 'default',
  warning: 'error',
};

export const CREATED_BY_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'system', label: 'Hệ thống' },
  { value: 'admin', label: 'Admin' },
] as const;

export const CREATED_BY_LABELS: Record<string, string> = {
  system: 'Hệ thống',
  admin: 'Admin',
};

// ----------------------------------------------------------------------

export type INotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  notification_type: string;
  read: boolean;
  created_by: string;
  created_at: string;
};

export type INotificationPagination = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
};

// User Notification (admin side)
export type IUserNotificationItem = {
  id: string;
  user_id: number;
  title: string;
  body: string | null;
  link: string | null;
  notification_type: string;
  read: boolean;
  created_by: string;
  created_at: string;
  user_email: string | null;
  user_display_name: string | null;
};
