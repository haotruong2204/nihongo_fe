import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
// types
import { IQuickReplyItem } from 'src/types/quick-reply';

// ----------------------------------------------------------------------

function parseQuickReplies(data: any): IQuickReplyItem[] {
  if (!data?.data?.resource?.data) return [];
  return data.data.resource.data.map((item: any) => ({
    id: String(item.id),
    ...item.attributes,
  }));
}

// ----------------------------------------------------------------------

type UseGetQuickRepliesParams = {
  page?: number;
  perPage?: number;
  search?: string;
  active?: string;
};

export function useGetQuickReplies({
  page = 1,
  perPage = 20,
  search = '',
  active = '',
}: UseGetQuickRepliesParams = {}) {
  const params: Record<string, any> = { page, per_page: perPage };

  if (search) {
    params['q[title_cont]'] = search;
  }
  if (active) {
    params['q[active_eq]'] = active;
  }

  const URL = [endpoints.quickReply.list, { params }];

  const { data, isLoading, mutate } = useSWR(URL, fetcher);

  const quickReplies = useMemo(() => parseQuickReplies(data), [data]);

  const pagination = useMemo(
    () =>
      data?.data?.pagy || {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: 20,
      },
    [data]
  );

  return useMemo(
    () => ({
      quickReplies,
      pagination,
      quickRepliesLoading: isLoading,
      quickRepliesEmpty: !isLoading && quickReplies.length === 0,
      quickRepliesMutate: mutate,
    }),
    [quickReplies, pagination, isLoading, mutate]
  );
}

// ----------------------------------------------------------------------

export async function createQuickReply(data: {
  title: string;
  content: string;
  image_url?: string;
  position?: number;
  active?: boolean;
}) {
  const res = await axiosInstance.post(endpoints.quickReply.list, {
    quick_reply: data,
  });
  return res.data;
}

export async function updateQuickReply(
  id: string,
  data: {
    title?: string;
    content?: string;
    image_url?: string;
    position?: number;
    active?: boolean;
  }
) {
  const URL = endpoints.quickReply.details(id);
  const res = await axiosInstance.patch(URL, { quick_reply: data });
  return res.data;
}

export async function deleteQuickReply(id: string) {
  const URL = endpoints.quickReply.details(id);
  const res = await axiosInstance.delete(URL);
  return res.data;
}
