import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
// types
import { IUserNotificationItem, INotificationPagination } from 'src/types/notification';

// ----------------------------------------------------------------------

function parseUserNotifications(data: any): IUserNotificationItem[] {
  if (!data?.data?.resource?.data) return [];
  return data.data.resource.data.map((item: any) => ({
    id: String(item.id),
    ...item.attributes,
  }));
}

// ----------------------------------------------------------------------

type UseGetUserNotificationsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  userId?: string;
  notificationType?: string;
  createdBy?: string;
};

export function useGetUserNotifications({
  page = 1,
  perPage = 20,
  search = '',
  userId = '',
  notificationType = '',
  createdBy = '',
}: UseGetUserNotificationsParams = {}) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
  };

  if (search) {
    params['q[title_cont]'] = search;
  }

  if (userId) {
    params['q[user_id_eq]'] = userId;
  }

  if (notificationType) {
    params['q[notification_type_eq]'] = notificationType;
  }

  if (createdBy) {
    params['q[created_by_eq]'] = createdBy;
  }

  const URL = [endpoints.userNotification.list, { params }];

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const notifications: IUserNotificationItem[] = useMemo(
    () => parseUserNotifications(data),
    [data]
  );

  const pagination: INotificationPagination = useMemo(
    () =>
      data?.data?.pagy || {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: perPage,
      },
    [data, perPage]
  );

  return useMemo(
    () => ({
      notifications,
      pagination,
      notificationsLoading: isLoading,
      notificationsError: error,
      notificationsValidating: isValidating,
      notificationsEmpty: !isLoading && !notifications.length,
      notificationsMutate: mutate,
    }),
    [notifications, pagination, isLoading, error, isValidating, mutate]
  );
}

// ----------------------------------------------------------------------

export async function createUserNotification(
  data: {
    user_id?: number;
    title: string;
    body?: string;
    link?: string;
    notification_type?: string;
  },
  sendToAll?: boolean
) {
  const params = sendToAll ? { send_to: 'all' } : {};
  const res = await axiosInstance.post(
    endpoints.userNotification.list,
    { user_notification: data },
    { params }
  );
  return res.data;
}

export async function updateUserNotification(
  id: string,
  data: {
    title?: string;
    body?: string;
    link?: string;
    notification_type?: string;
  }
) {
  const URL = endpoints.userNotification.details(id);
  const res = await axiosInstance.patch(URL, { user_notification: data });
  return res.data;
}

export async function deleteUserNotification(id: string) {
  const URL = endpoints.userNotification.details(id);
  const res = await axiosInstance.delete(URL);
  return res.data;
}
