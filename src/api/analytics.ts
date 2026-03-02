import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

type WidgetSummaryItem = {
  value: string;
  label: string;
  total: number;
  icon: string;
};

type ChartSeries = {
  name: string;
  type: string;
  fill?: string;
  data: number[];
};

type RadarSeries = {
  name: string;
  data: number[];
};

type PieSeries = {
  label: string;
  value: number;
};

type TopPage = {
  label: string;
  value: number;
};

type FeedbackItem = {
  id: string;
  title: string;
  description: string;
  postedAt: number | Date;
  coverUrl: string;
};

type ActivityItem = {
  id: string;
  title: string;
  time: Date;
  type: string;
};

export type AnalyticsData = {
  widgets: {
    total_users: number;
    premium_users: number;
    reviews_today: number;
    pending_feedbacks: number;
  };
  daily_activity: {
    labels: string[];
    series: ChartSeries[];
  };
  srs_distribution: PieSeries[];
  top_pages: TopPage[];
  jlpt_performance: {
    categories: string[];
    series: RadarSeries[];
  };
  recent_feedbacks: FeedbackItem[];
  recent_activities: ActivityItem[];
  feature_usage: WidgetSummaryItem[];
};

// ----------------------------------------------------------------------

export function useGetAnalytics() {
  const { data, isLoading, error } = useSWR(endpoints.analytics, fetcher);

  const analyticsData: AnalyticsData | null = useMemo(() => {
    if (!data?.data?.resource) return null;
    return data.data.resource;
  }, [data]);

  return useMemo(
    () => ({
      analytics: analyticsData,
      analyticsLoading: isLoading,
      analyticsError: error,
    }),
    [analyticsData, isLoading, error]
  );
}
