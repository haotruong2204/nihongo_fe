// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// components
import { useSettingsContext } from 'src/components/settings';
// locales
import { useLocales } from 'src/locales';
// api
import { useGetAnalytics } from 'src/api/analytics';
// components
import Iconify from 'src/components/iconify';
//
import AnalyticsNews from '../analytics-news';
import AnalyticsCurrentVisits from '../analytics-current-visits';
import AnalyticsOrderTimeline from '../analytics-order-timeline';
import AnalyticsWebsiteVisits from '../analytics-website-visits';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsTrafficBySite from '../analytics-traffic-by-site';
import AnalyticsCurrentSubject from '../analytics-current-subject';
import AnalyticsConversionRates from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export default function OverviewAnalyticsView() {
  const settings = useSettingsContext();

  const { t } = useLocales();

  const { analytics, analyticsLoading } = useGetAnalytics();

  if (analyticsLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 10 }}>
          {t('no_analytics_data')}
        </Typography>
      </Container>
    );
  }

  const { widgets, record_stats, daily_activity, srs_distribution, top_pages, jlpt_performance, recent_feedbacks, recent_activities, feature_usage } = analytics;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {t('analytics_dashboard')}
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title={t('total_users')}
            total={widgets.total_users}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title={t('premium_users')}
            total={widgets.premium_users}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title={t('new_users_today')}
            total={widgets.new_users_today}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title={t('records_today')}
            total={record_stats?.records_today || null}
            color="success"
            placeholder={t('not_updated')}
            icon={<Iconify icon="solar:document-bold-duotone" width={64} />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title={t('total_records')}
            total={record_stats?.total_records || null}
            color="info"
            placeholder={t('not_updated')}
            icon={<Iconify icon="solar:database-bold-duotone" width={64} />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title={t('requests_today')}
            total={record_stats?.requests_today || null}
            color="warning"
            placeholder={t('not_updated')}
            icon={<Iconify icon="solar:server-square-cloud-bold-duotone" width={64} />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title={t('daily_activity')}
            subheader={t('last_30_days')}
            chart={{
              labels: daily_activity.labels,
              series: daily_activity.series,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title={t('srs_distribution')}
            chart={{
              series: srs_distribution,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title={t('top_pages')}
            subheader={t('by_total_views')}
            chart={{
              series: top_pages,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentSubject
            title={t('jlpt_performance')}
            chart={{
              categories: jlpt_performance.categories,
              series: jlpt_performance.series,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsNews title={t('recent_feedbacks')} list={recent_feedbacks} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline title={t('recent_activities')} list={recent_activities} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTrafficBySite title={t('feature_usage')} list={feature_usage} />
        </Grid>
      </Grid>
    </Container>
  );
}
