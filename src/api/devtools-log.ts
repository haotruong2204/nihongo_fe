import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';
// types
import { IDevtoolsLogItem, IDevtoolsLogPagination } from 'src/types/devtools-log';

// ----------------------------------------------------------------------

type UseGetDevtoolsLogsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export function useGetDevtoolsLogs({
  page = 1,
  perPage = 20,
  search = '',
  sortBy = '',
  sortOrder = 'desc',
}: UseGetDevtoolsLogsParams = {}) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
  };

  if (search) {
    params['q[ip_address_or_email_cont]'] = search;
  }

  if (sortBy) {
    params['q[s]'] = `${sortBy} ${sortOrder}`;
  }

  const URL = [endpoints.devtoolsLog.list, { params }];

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });

  const logs: IDevtoolsLogItem[] = useMemo(() => {
    if (!data?.data?.resource?.data) return [];
    return data.data.resource.data.map((item: any) => ({
      id: item.id,
      ...item.attributes,
    }));
  }, [data]);

  const pagination: IDevtoolsLogPagination = useMemo(
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
      logs,
      pagination,
      logsLoading: isLoading,
      logsError: error,
      logsValidating: isValidating,
      logsEmpty: !isLoading && !logs.length,
      logsMutate: mutate,
    }),
    [logs, pagination, isLoading, error, isValidating, mutate]
  );
}
