import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
// types
import {
  IRequestStatItem,
  IRequestStatPagination,
  IRequestStatRealtime,
  IRequestStatSummary,
} from 'src/types/request-stats';

// ----------------------------------------------------------------------

type UseGetRequestStatsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  flagged?: string;
};

export function useGetRequestStats({
  page = 1,
  perPage = 10,
  search = '',
  flagged = 'all',
}: UseGetRequestStatsParams = {}) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
  };

  if (search) {
    params['q[user_id_eq]'] = search;
  }

  if (flagged !== 'all') {
    params['q[flagged_eq]'] = flagged === 'true';
  }

  const URL = [endpoints.requestStats.list, { params }];

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const stats: IRequestStatItem[] = useMemo(() => {
    if (!data?.data?.resource?.data) return [];
    return data.data.resource.data.map((item: any) => ({
      id: item.id,
      ...item.attributes,
    }));
  }, [data]);

  const pagination: IRequestStatPagination = useMemo(
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
      stats,
      pagination,
      statsLoading: isLoading,
      statsError: error,
      statsValidating: isValidating,
      statsEmpty: !isLoading && !stats.length,
      statsMutate: mutate,
    }),
    [stats, pagination, isLoading, error, isValidating, mutate]
  );
}

// ----------------------------------------------------------------------

export function useGetRequestStatsSummary() {
  const URL = endpoints.requestStats.summary;

  const { data, isLoading, error } = useSWR(URL, fetcher);

  const summary: IRequestStatSummary | null = useMemo(
    () => data?.data?.resource || null,
    [data]
  );

  return useMemo(
    () => ({
      summary,
      summaryLoading: isLoading,
      summaryError: error,
    }),
    [summary, isLoading, error]
  );
}

// ----------------------------------------------------------------------

export async function getRealtimeStats(userId: string): Promise<IRequestStatRealtime | null> {
  try {
    const URL = endpoints.requestStats.realtime(userId);
    const res = await axiosInstance.get(URL);
    return res.data?.data?.resource || null;
  } catch (error) {
    console.error('[RequestStats] Realtime fetch error:', error);
    return null;
  }
}
