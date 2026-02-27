import useSWR from 'swr';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
import { getCableConsumer } from 'src/utils/actioncable';
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

function mapReplies(item: any, included: any[], usersMap: Record<string, IFeedbackUser>): IFeedbackItem[] {
  const replyIds = item.relationships?.replies?.data;
  if (!replyIds || !Array.isArray(replyIds) || !included) return [];

  return replyIds
    .map((ref: any) => {
      const replyData = included.find((inc: any) => inc.type === 'feedback' && String(inc.id) === String(ref.id));
      if (!replyData) return null;
      const userId = replyData.relationships?.user?.data?.id;
      return {
        ...replyData.attributes,
        id: String(replyData.id),
        user: userId ? usersMap[String(userId)] || null : null,
        replies: [],
      };
    })
    .filter(Boolean) as IFeedbackItem[];
}

function mapFeedback(item: any, usersMap: Record<string, IFeedbackUser>, included?: any[]): IFeedbackItem {
  const userId = item.relationships?.user?.data?.id;
  return {
    ...item.attributes,
    id: String(item.id),
    user: userId ? usersMap[String(userId)] || null : null,
    replies: included ? mapReplies(item, included, usersMap) : [],
  };
}

function parseFeedbacks(data: any): IFeedbackItem[] {
  if (!data?.data?.resource?.data) return [];
  const { included } = data.data.resource;
  const usersMap = buildIncludedMap(included);
  return data.data.resource.data.map((item: any) => mapFeedback(item, usersMap, included));
}

// ----------------------------------------------------------------------

type UseGetFeedbacksParams = {
  perPage?: number;
};

export function useGetFeedbacks({ perPage = 20 }: UseGetFeedbacksParams = {}) {
  const [extraPages, setExtraPages] = useState<IFeedbackItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const URL = [endpoints.feedback.list, { params: { page: 1, per_page: perPage } }];

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const firstPageFeedbacks = useMemo(() => parseFeedbacks(data), [data]);

  const feedbacks = useMemo(
    () => [...firstPageFeedbacks, ...extraPages],
    [firstPageFeedbacks, extraPages]
  );

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

  const hasMore = currentPage < pagination.total_pages;

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await axiosInstance.get(endpoints.feedback.list, {
        params: { page: nextPage, per_page: perPage },
      });
      const newFeedbacks = parseFeedbacks(res.data);
      setExtraPages((prev) => [...prev, ...newFeedbacks]);
      setCurrentPage(nextPage);
    } catch (e) {
      console.error('Failed to load more feedbacks:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, perPage]);

  const resetAndMutate = useCallback(() => {
    setExtraPages([]);
    setCurrentPage(1);
    return mutate();
  }, [mutate]);

  return useMemo(
    () => ({
      feedbacks,
      pagination,
      feedbacksLoading: isLoading,
      feedbacksError: error,
      feedbacksValidating: isValidating,
      feedbacksEmpty: !isLoading && !feedbacks.length,
      feedbacksMutate: resetAndMutate,
      feedbacksHasMore: hasMore,
      feedbacksLoadMore: loadMore,
      feedbacksLoadingMore: loadingMore,
    }),
    [feedbacks, pagination, isLoading, error, isValidating, resetAndMutate, hasMore, loadMore, loadingMore]
  );
}

// ----------------------------------------------------------------------

export function useGetFeedback(id: string) {
  const URL = id ? endpoints.feedback.details(id) : null;

  const { data, isLoading, error, mutate } = useSWR(URL, fetcher);

  const feedback: IFeedbackItem | null = useMemo(() => {
    if (!data?.data?.resource?.data) return null;
    const { data: item, included } = data.data.resource;
    const usersMap = buildIncludedMap(included);
    return mapFeedback(item, usersMap, included);
  }, [data]);

  return useMemo(
    () => ({
      feedback,
      feedbackLoading: isLoading,
      feedbackError: error,
      feedbackMutate: mutate,
    }),
    [feedback, isLoading, error, mutate]
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

// ----------------------------------------------------------------------

export async function createFeedbackReply(feedbackId: string, text: string) {
  const URL = endpoints.feedback.replies(feedbackId);
  const res = await axiosInstance.post(URL, { reply: { text } });
  return res.data;
}

// ----------------------------------------------------------------------
// WebSocket hook for realtime admin feedbacks

export function useAdminFeedbackChannel(onUpdate: () => void) {
  const subscriptionRef = useRef<any>(null);
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const consumer = getCableConsumer();
    if (!consumer) return undefined;

    subscriptionRef.current = consumer.subscriptions.create(
      { channel: 'FeedbackChannel' },
      {
        received(data: any) {
          if (
            ['new_feedback', 'new_reply', 'feedback_updated', 'feedback_deleted'].includes(
              data?.type
            )
          ) {
            callbackRef.current();
          }
        },
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);
}
