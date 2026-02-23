import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
// types
import { IUserItem, IUserPagination, IUserStats } from 'src/types/user';

// ----------------------------------------------------------------------

type UseGetUsersParams = {
  page?: number;
  perPage?: number;
  search?: string;
  isPremium?: string;
};

export function useGetUsers({
  page = 1,
  perPage = 10,
  search = '',
  isPremium = 'all',
}: UseGetUsersParams = {}) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
  };

  if (search) {
    params['q[display_name_or_email_cont]'] = search;
  }

  if (isPremium !== 'all') {
    params['q[is_premium_eq]'] = isPremium === 'true';
  }

  const URL = [endpoints.user.list, { params }];

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const users: IUserItem[] = useMemo(() => {
    if (!data?.data?.resource?.data) return [];
    return data.data.resource.data.map((item: any) => ({
      id: item.id,
      ...item.attributes,
    }));
  }, [data]);

  const pagination: IUserPagination = useMemo(
    () =>
      data?.data?.pagy || {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: perPage,
      },
    [data, perPage]
  );

  const memoizedValue = useMemo(
    () => ({
      users,
      pagination,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !users.length,
      usersMutate: mutate,
    }),
    [users, pagination, isLoading, error, isValidating, mutate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetUser(id: string) {
  const URL = id ? endpoints.user.details(id) : null;

  const { data, isLoading, error } = useSWR(URL, fetcher);

  const user: IUserItem | null = useMemo(() => {
    if (!data?.data?.resource?.data) return null;
    const item = data.data.resource.data;
    return {
      id: item.id,
      ...item.attributes,
    };
  }, [data]);

  const stats: IUserStats | null = useMemo(() => data?.data?.stats || null, [data]);

  const memoizedValue = useMemo(
    () => ({
      user,
      stats,
      userLoading: isLoading,
      userError: error,
    }),
    [user, stats, isLoading, error]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type UseGetUserResourcesParams = {
  page?: number;
  perPage?: number;
};

export function useGetUserResources(
  userId: string,
  resource: string,
  { page = 1, perPage = 10 }: UseGetUserResourcesParams = {}
) {
  const URL = userId && resource
    ? [endpoints.user.resources(userId, resource), { params: { page, per_page: perPage } }]
    : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const items: Record<string, any>[] = useMemo(() => {
    if (!data?.data?.resource?.data) return [];
    return data.data.resource.data.map((item: any) => ({
      id: item.id,
      ...item.attributes,
    }));
  }, [data]);

  const pagination: IUserPagination = useMemo(
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
      items,
      pagination,
      isLoading,
      error,
      isValidating,
      isEmpty: !isLoading && !items.length,
    }),
    [items, pagination, isLoading, error, isValidating]
  );
}

// ----------------------------------------------------------------------

export async function deleteUser(id: string) {
  const URL = endpoints.user.delete(id);
  const res = await axiosInstance.delete(URL);
  return res.data;
}

// ----------------------------------------------------------------------

export async function updateUser(
  id: string,
  data: {
    is_premium?: boolean;
    is_banned?: boolean;
    banned_reason?: string | null;
    premium_until?: string | null;
  }
) {
  const URL = endpoints.user.update(id);
  const res = await axiosInstance.patch(URL, { user: data });
  return res.data;
}
