// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
// components
import Iconify from 'src/components/iconify';
// types
import { IRequestStatSummary } from 'src/types/request-stats';

// ----------------------------------------------------------------------

type Props = {
  summary: IRequestStatSummary | null;
  loading: boolean;
};

export default function RequestStatsSummaryCards({ summary, loading }: Props) {
  const cards = [
    {
      title: 'Total Requests (7d)',
      value: summary?.total_requests ?? 0,
      icon: 'solar:chart-2-bold-duotone',
      color: 'primary.main',
    },
    {
      title: 'Unique Users',
      value: summary?.unique_users ?? 0,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'info.main',
    },
    {
      title: 'Flagged',
      value: summary?.flagged_count ?? 0,
      icon: 'solar:flag-bold-duotone',
      color: summary?.flagged_count ? 'error.main' : 'success.main',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(3, 1fr)',
        },
      }}
    >
      {cards.map((card) => (
        <Card key={card.title} sx={{ p: 3 }}>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={80} height={40} />
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {card.title}
                </Typography>
                <Typography variant="h3">
                  {card.value.toLocaleString()}
                </Typography>
              </Stack>
              <Iconify icon={card.icon} width={48} sx={{ color: card.color, opacity: 0.64 }} />
            </Stack>
          )}
        </Card>
      ))}
    </Box>
  );
}
