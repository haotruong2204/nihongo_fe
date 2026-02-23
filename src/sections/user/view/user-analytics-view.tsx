import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetUser } from 'src/api/user';
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

  const navigate = useNavigate();

  const { id = '' } = useParams();

  const { user, stats, userLoading } = useGetUser(id);

  const handleCardClick = (resource: string) => {
    navigate(paths.dashboard.user.resource(id, resource));
  };

  if (userLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h6">User not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={user.display_name}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.list },
          { name: user.display_name },
        ]}
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
                {user.is_premium ? 'Premium' : 'Free'}
              </Label>
              <Label variant="soft" color={user.is_banned ? 'error' : 'success'}>
                {user.is_banned ? 'Banned' : 'Active'}
              </Label>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {stats && (
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('srs_cards')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title="SRS Cards"
                total={stats.srs_cards_count}
                color="primary"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('review_logs')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title="Review Logs"
                total={stats.review_logs_count}
                color="info"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('custom_vocab_items')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title="Custom Vocab"
                total={stats.custom_vocab_items_count}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('roadmap_day_progresses')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title="Roadmap Progress"
                total={stats.roadmap_day_progresses_count}
                color="error"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('tango_lesson_progresses')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title="Tango Lessons"
                total={stats.tango_lesson_progresses_count}
                color="success"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box onClick={() => handleCardClick('jlpt_test_results')} sx={{ cursor: 'pointer' }}>
              <AnalyticsWidgetSummary
                title="JLPT Tests"
                total={stats.jlpt_test_results_count}
                color="secondary"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
