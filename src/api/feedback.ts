import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
// types
import { IFeedbackItem, IFeedbackPagination, IFeedbackUser } from 'src/types/feedback';

// ----------------------------------------------------------------------

function buildIncludedMap(included: any[]): Record<string, IFeedbackUser> {
  const map: Record<string, IFeedbackUser> = {};
  if (!included) return map;
  included
    .filter((item: any) => item.type === 'user')
    .forEach((item: any) => {
      map[item.id] = {
        id: item.id,
        ...item.attributes,
      };
    });
  return map;
}

function mapFeedback(item: any, usersMap: Record<string, IFeedbackUser>): IFeedbackItem {
  const userId = item.relationships?.user?.data?.id;
  return {
    ...item.attributes,
    id: String(item.id),
    user: userId ? usersMap[String(userId)] || null : null,
  };
}

// ----------------------------------------------------------------------

type UseGetFeedbacksParams = {
  page?: number;
  perPage?: number;
};

export function useGetFeedbacks({ page = 1, perPage = 20 }: UseGetFeedbacksParams = {}) {
  const URL = [endpoints.feedback.list, { params: { page, per_page: perPage } }];

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const feedbacks: IFeedbackItem[] = useMemo(() => {
    if (!data?.data?.resource?.data) return [];
    const usersMap = buildIncludedMap(data.data.resource.included);
    return data.data.resource.data.map((item: any) => mapFeedback(item, usersMap));
  }, [data]);

  const pagination: IFeedbackPagination = useMemo(
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
      feedbacks,
      pagination,
      feedbacksLoading: isLoading,
      feedbacksError: error,
      feedbacksValidating: isValidating,
      feedbacksEmpty: !isLoading && !feedbacks.length,
      feedbacksMutate: mutate,
    }),
    [feedbacks, pagination, isLoading, error, isValidating, mutate]
  );
}

// ----------------------------------------------------------------------

export function useGetFeedback(id: string) {
  const URL = id ? endpoints.feedback.details(id) : null;

  const { data, isLoading, error } = useSWR(URL, fetcher);

  const feedback: IFeedbackItem | null = useMemo(() => {
    if (!data?.data?.resource?.data) return null;
    const item = data.data.resource.data;
    const usersMap = buildIncludedMap(data.data.resource.included);
    return mapFeedback(item, usersMap);
  }, [data]);

  return useMemo(
    () => ({
      feedback,
      feedbackLoading: isLoading,
      feedbackError: error,
    }),
    [feedback, isLoading, error]
  );
}

// ----------------------------------------------------------------------

export async function updateFeedback(
  id: string,
  data: {
    status?: string;
    admin_reply?: string | null;
    display?: boolean;
  }
) {
  const URL = endpoints.feedback.details(id);
  const res = await axiosInstance.patch(URL, { feedback: data });
  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteFeedback(id: string) {
  const URL = endpoints.feedback.details(id);
  const res = await axiosInstance.delete(URL);
  return res.data;
}
