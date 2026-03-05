export type IDevtoolsLogItem = {
  id: string;
  ip_address: string;
  user_agent: string | null;
  email: string | null;
  open_count: number;
  last_detected_at: string;
  created_at: string;
  user_id: string | null;
};

export type IDevtoolsLogTableFilters = {
  search: string;
};

export type IDevtoolsLogTableFilterValue = string;

export type IDevtoolsLogPagination = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
};
