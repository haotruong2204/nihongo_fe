export type IRevenueTransaction = {
  id: string;
  email: string;
  display_name: string;
  photo_url: string | null;
  amount: number;
  plan_type: 'monthly' | 'yearly';
  premium_until: string | null;
  created_at: string;
};

export type IRevenueChartItem = {
  month: string;
  revenue: number;
};

export type IRevenueStats = {
  total_revenue: number;
  this_month_revenue: number;
  last_month_revenue: number;
  monthly_count: number;
  yearly_count: number;
  monthly_chart: IRevenueChartItem[];
  recent_transactions: IRevenueTransaction[];
};
