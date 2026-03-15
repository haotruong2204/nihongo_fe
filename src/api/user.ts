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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  ipSearch?: string;
};

export function useGetUsers({
  page = 1,
  perPage = 10,
  search = '',
  isPremium = 'all',
  sortBy = '',
  sortOrder = 'desc',
  ipSearch = '',
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

  if (ipSearch) {
    params.ip = ipSearch;
  }

  if (sortBy) {
    params['q[s]'] = `${sortBy} ${sortOrder}`;
  }

  const URL = [endpoints.user.list, { params }];

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
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

  const { data, isLoading, error } = useSWR(URL, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });

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

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
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
      mutate,
    }),
    [items, pagination, isLoading, error, isValidating, mutate]
  );
}

// ----------------------------------------------------------------------

type UseGetUserSrsCardsParams = {
  page?: number;
  perPage?: number;
  status?: string;
  cardType?: string;
};

export function useGetUserSrsCards(
  userId: string,
  { page = 1, perPage = 10, status = '', cardType = '' }: UseGetUserSrsCardsParams = {}
) {
  const params: Record<string, any> = { page, per_page: perPage };
  if (status) params.status = status;
  if (cardType) params.card_type = cardType;

  const URL = userId
    ? [endpoints.user.srsCards(userId), { params }]
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
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
      mutate,
    }),
    [items, pagination, isLoading, error, isValidating, mutate]
  );
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type UseGetUserJlptTestResultsParams = {
  page?: number;
  perPage?: number;
  level?: string;
  passed?: string;
};

export function useGetUserJlptTestResults(
  userId: string,
  { page = 1, perPage = 10, level = '', passed = '' }: UseGetUserJlptTestResultsParams = {}
) {
  const params: Record<string, any> = { page, per_page: perPage };
  if (level) params.level = level;
  if (passed !== '') params.passed = passed;

  const URL = userId
    ? [endpoints.user.resources(userId, 'jlpt_test_results'), { params }]
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
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
      mutate,
    }),
    [items, pagination, isLoading, error, isValidating, mutate]
  );
}

// ----------------------------------------------------------------------

export async function deleteSrsCard(userId: string, cardId: string) {
  const URL = endpoints.user.srsCard(userId, cardId);
  const res = await axiosInstance.delete(URL);
  return res.data;
}

export async function deleteCustomVocabItem(userId: string, itemId: string) {
  const URL = endpoints.user.customVocabItem(userId, itemId);
  const res = await axiosInstance.delete(URL);
  return res.data;
}

export async function deleteUserDevice(userId: string, deviceId: string) {
  const URL = endpoints.user.userDevice(userId, deviceId);
  const res = await axiosInstance.delete(URL);
  return res.data;
}

export async function deleteVocabSet(userId: string, setId: string) {
  const URL = endpoints.user.vocabSet(userId, setId);
  const res = await axiosInstance.delete(URL);
  return res.data;
}

export async function removeVocabSetItem(userId: string, setId: string, index: number) {
  const URL = endpoints.user.vocabSetRemoveItem(userId, setId);
  const res = await axiosInstance.delete(URL, { params: { index } });
  return res.data;
}

export async function resetSrsCard(userId: string, cardId: string) {
  const URL = endpoints.user.resetSrsCard(userId, cardId);
  const res = await axiosInstance.patch(URL);
  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteUser(id: string) {
  const URL = endpoints.user.delete(id);
  const res = await axiosInstance.delete(URL);
  return res.data;
}

// ----------------------------------------------------------------------

export async function searchUsers(query: string): Promise<IUserItem[]> {
  if (!query || query.length < 1) return [];
  const params: Record<string, any> = {
    per_page: 10,
    'q[display_name_or_email_cont]': query,
  };
  const res = await axiosInstance.get(endpoints.user.list, { params });
  const { data } = res;
  if (!data?.data?.resource?.data) return [];
  return data.data.resource.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
}

// ----------------------------------------------------------------------

export async function recalculateUserCounters(id: string) {
  const URL = endpoints.user.recalculateCounters(id);
  const res = await axiosInstance.post(URL);
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
