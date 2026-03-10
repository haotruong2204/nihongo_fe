import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// utils
import { fDateTime } from 'src/utils/format-time';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetUser, recalculateUserCounters } from 'src/api/user';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
// locales
import { useLocales } from 'src/locales';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Label from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
//
import AnalyticsWidgetSummary from 'src/sections/overview/analytics/analytics-widget-summary';

// ----------------------------------------------------------------------

export default function UserAnalyticsView() {
  const settings = useSettingsContext();

  const { t } = useLocales();

  const navigate = useNavigate();

  const { id = '' } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [syncing, setSyncing] = useState(false);

  const { user, stats, userLoading } = useGetUser(id);

  const handleSyncCounters = async () => {
    setSyncing(true);
    try {
      await recalculateUserCounters(id);
      enqueueSnackbar('Đã đồng bộ số liệu!', { variant: 'success' });
      window.location.reload();
    } catch {
      enqueueSnackbar('Đồng bộ thất bại!', { variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleCardClick = (resource: string) => {
    navigate(paths.dashboard.user.resource(id, resource));
  };

  if (userLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h6">{t('user_not_found')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={user.display_name}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('user'), href: paths.dashboard.user.list },
          { name: user.display_name },
        ]}
        action={
          <Tooltip title="Đồng bộ lại counter cache & xóa Redis cache">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="solar:refresh-bold" />}
              onClick={handleSyncCounters}
              disabled={syncing}
            >
              {syncing ? 'Đang sync...' : 'Sync số liệu'}
            </Button>
          </Tooltip>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            alt={user.display_name}
            src={user.photo_url}
            sx={{ width: 64, height: 64 }}
          />
          <Stack spacing={0.5}>
            <Typography variant="h6">{user.display_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Label variant="soft" color={user.is_premium ? 'success' : 'default'}>
                {user.is_premium ? t('premium') : t('free')}
              </Label>
              <Label variant="soft" color={user.is_banned ? 'error' : 'success'}>
                {user.is_banned ? t('banned') : t('active')}
              </Label>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {t('last_login')}: <strong>{user.last_login_at ? fDateTime(user.last_login_at) : '-'}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('joined')}: <strong>{user.created_at ? fDateTime(user.created_at) : '-'}</strong>
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {stats && (
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('srs_cards')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('srs_cards')}
                total={stats.srs_cards_count}
                color="primary"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('review_logs')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('review_logs')}
                total={stats.review_logs_count}
                color="info"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('vocab_sets')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('vocab_sets')}
                total={stats.vocab_sets_count}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('roadmap_day_progresses')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('roadmap_progress')}
                total={stats.roadmap_day_progresses_count}
                color="error"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('tango_lesson_progresses')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('tango_lessons')}
                total={stats.tango_lesson_progresses_count}
                color="success"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('jlpt_test_results')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('jlpt_tests')}
                total={stats.jlpt_test_results_count}
                color="secondary"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('login_activities')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('login_activities')}
                total={stats.login_activities_count}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('page_views')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('page_views')}
                total={stats.page_views_count}
                color="info"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('custom_vocab_items')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title={t('custom_vocab_items')}
                total={stats.custom_vocab_items_count}
                color="primary"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
