import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
// types
import { IUserItem, IUserPagination } from 'src/types/user';

// ----------------------------------------------------------------------

type UseGetUsersParams = {
  page?: number;
  perPage?: number;
  search?: string;
  provider?: string;
  isPremium?: string;
};

export function useGetUsers({
  page = 1,
  perPage = 10,
  search = '',
  provider = '',
  isPremium = 'all',
}: UseGetUsersParams = {}) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
  };

  if (search) {
    params['q[display_name_or_email_cont]'] = search;
  }

  if (provider) {
    params['q[provider_eq]'] = provider;
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
