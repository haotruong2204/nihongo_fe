// ----------------------------------------------------------------------

export type INotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  notification_type: string;
  read: boolean;
  created_at: string;
};

export type INotificationPagination = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
};
