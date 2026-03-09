import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';
// types
import { IRevenueStats } from 'src/types/revenue';

// ----------------------------------------------------------------------

export function useGetRevenueStats() {
  const { data, isLoading, error } = useSWR(endpoints.revenue, fetcher);

  const stats: IRevenueStats | null = useMemo(() => data?.data?.revenue ?? null, [data]);

  return { stats, isLoading, error };
}
