import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
// types
import { INotificationItem, INotificationPagination } from 'src/types/notification';

// ----------------------------------------------------------------------

function parseNotifications(data: any): INotificationItem[] {
  if (!data?.data?.resource?.data) return [];
  return data.data.resource.data.map((item: any) => ({
    id: String(item.id),
    ...item.attributes,
  }));
}

// ----------------------------------------------------------------------

type UseGetNotificationsParams = {
  createdBy?: string;
  notificationType?: string;
};

export function useGetNotifications({
  createdBy = '',
  notificationType = '',
}: UseGetNotificationsParams = {}) {
  const params: Record<string, any> = { per_page: 50 };

  if (createdBy) {
    params['q[created_by_eq]'] = createdBy;
  }

  if (notificationType) {
    params['q[notification_type_eq]'] = notificationType;
  }

  const URL = [endpoints.notification.list, { params }];

  const { data, isLoading, error, mutate } = useSWR(URL, fetcher, {
    refreshInterval: 30000,
  });

  const notifications = useMemo(() => parseNotifications(data), [data]);

  const unreadCount: number = useMemo(() => data?.data?.unread_count ?? 0, [data]);

  const pagination: INotificationPagination = useMemo(
    () =>
      data?.data?.pagy || {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: 50,
      },
    [data]
  );

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      pagination,
      notificationsLoading: isLoading,
      notificationsError: error,
      notificationsMutate: mutate,
    }),
    [notifications, unreadCount, pagination, isLoading, error, mutate]
  );
}

// ----------------------------------------------------------------------

export async function markNotificationRead(id: string) {
  const URL = endpoints.notification.markRead(id);
  const res = await axiosInstance.patch(URL);
  return res.data;
}

export async function markAllNotificationsRead() {
  const URL = endpoints.notification.markAllRead;
  const res = await axiosInstance.patch(URL);
  return res.data;
}

// ----------------------------------------------------------------------
// CRUD for admin notifications

export async function createAdminNotification(data: {
  title: string;
  body?: string;
  link?: string;
  notification_type?: string;
}) {
  const res = await axiosInstance.post(endpoints.notification.list, {
    admin_notification: data,
  });
  return res.data;
}

export async function updateAdminNotification(
  id: string,
  data: {
    title?: string;
    body?: string;
    link?: string;
    notification_type?: string;
  }
) {
  const URL = endpoints.notification.details(id);
  const res = await axiosInstance.patch(URL, { admin_notification: data });
  return res.data;
}

export async function deleteAdminNotification(id: string) {
  const URL = endpoints.notification.details(id);
  const res = await axiosInstance.delete(URL);
  return res.data;
}
