// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
// api
import { useGetRevenueStats } from 'src/api/revenue';
// types
import { IRevenueTransaction } from 'src/types/revenue';
// utils
import { fVND } from 'src/utils/format-number';
// components
import { useSettingsContext } from 'src/components/settings';
//
import BankingWidgetSummary from '../banking-widget-summary';
import BankingBalanceStatistics from '../banking-balance-statistics';
import BankingRecentTransitions from '../banking-recent-transitions';
import BankingExpensesCategories from '../banking-expenses-categories';

// ----------------------------------------------------------------------

function toSparkline(revenues: number[]) {
  return revenues.map((y, i) => ({ x: i + 1, y }));
}

function toTransitionRow(t: IRevenueTransaction) {
  return {
    id: String(t.id),
    type: 'Income' as const,
    status: 'completed',
    amount: t.amount,
    message: t.display_name || t.email,
    category: t.plan_type === 'yearly' ? 'Gói năm' : 'Gói tháng',
    name: t.display_name,
    avatarUrl: t.photo_url,
    date: t.created_at,
    endDate: t.premium_until,
  };
}

// ----------------------------------------------------------------------

export default function OverviewBankingView() {
  const settings = useSettingsContext();

  const { stats, isLoading } = useGetRevenueStats();

  const revenues = stats?.monthly_chart.map((m) => m.revenue) ?? [];
  const categories = stats?.monthly_chart.map((m) => m.month) ?? [];

  const percent =
    stats && stats.last_month_revenue > 0
      ? ((stats.this_month_revenue - stats.last_month_revenue) / stats.last_month_revenue) * 100
      : 0;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        {/* Summary widgets */}
        <Grid xs={12} md={7}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            {isLoading ? (
              <>
                <Skeleton variant="rounded" width="100%" height={220} />
                <Skeleton variant="rounded" width="100%" height={220} />
              </>
            ) : (
              <>
                <BankingWidgetSummary
                  title="Tổng doanh thu"
                  icon="solar:wallet-money-bold"
                  percent={percent}
                  total={stats?.total_revenue ?? 0}
                  chart={{ series: toSparkline(revenues) }}
                />

                <BankingWidgetSummary
                  title="Tháng này"
                  color="warning"
                  icon="solar:calendar-bold"
                  percent={percent}
                  total={stats?.this_month_revenue ?? 0}
                  chart={{ series: toSparkline(revenues) }}
                />
              </>
            )}
          </Stack>
        </Grid>

        {/* Plan type breakdown */}
        <Grid xs={12} md={5}>
          <BankingExpensesCategories
            title="Loại gói"
            chart={{
              series: [
                { label: 'Gói tháng', value: stats?.monthly_count ?? 0 },
                { label: 'Gói năm', value: stats?.yearly_count ?? 0 },
              ],
              colors: ['#00A76F', '#FFAB00'],
              options: {
                chart: { type: 'donut' },
                tooltip: {
                  y: { formatter: (v: number) => `${v} người` },
                },
              },
            }}
            bottomStats={[
              { label: 'Gói tháng', value: stats?.monthly_count ?? 0 },
              { label: 'Gói năm', value: stats?.yearly_count ?? 0 },
              { label: 'Tổng doanh thu', value: fVND(stats?.total_revenue ?? 0) },
            ]}
          />
        </Grid>

        {/* Monthly revenue chart */}
        <Grid xs={12}>
          <BankingBalanceStatistics
            title="Doanh thu theo tháng"
            subheader={stats ? `Tháng này: ${fVND(stats.this_month_revenue)} — Tháng trước: ${fVND(stats.last_month_revenue)}` : ''}
            chart={{
              categories,
              series: [
                {
                  type: 'Tháng',
                  data: [{ name: 'Doanh thu', data: revenues }],
                },
              ],
              options: {
                tooltip: {
                  y: {
                    formatter: (value: number) => fVND(value),
                  },
                },
              },
            }}
          />
        </Grid>

        {/* Recent transactions */}
        <Grid xs={12}>
          <BankingRecentTransitions
            title="Giao dịch gần đây"
            tableData={(stats?.recent_transactions ?? []).map(toTransitionRow)}
            tableLabels={[
              { id: 'description', label: 'Người dùng' },
              { id: 'date', label: 'Ngày' },
              { id: 'amount', label: 'Số tiền' },
              { id: 'status', label: 'Trạng thái' },
              { id: '' },
            ]}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
