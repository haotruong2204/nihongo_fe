// ----------------------------------------------------------------------

export type IRequestStatItem = {
  id: string;
  user_id: number;
  date: string;
  total_requests: number;
  endpoint_stats: Record<string, number>;
  flagged: boolean;
  flag_reason: string | null;
  created_at: string;
};

export type IRequestStatPagination = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
};

export type IRequestStatFilters = {
  search: string;
  flagged: string; // 'all' | 'true' | 'false'
};

export type IRequestStatFilterValue = string;

export type IRequestStatRealtime = {
  user_id: number;
  date: string;
  total_requests: number;
  endpoint_stats: Record<string, number>;
};

export type IRequestStatSummary = {
  period: { from: string; to: string };
  total_requests: number;
  flagged_count: number;
  unique_users: number;
  top_users: { user_id: number; total: number }[];
};
