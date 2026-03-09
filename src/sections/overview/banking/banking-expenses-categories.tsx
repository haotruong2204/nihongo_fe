import { ApexOptions } from 'apexcharts';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ApexOptions;
  };
  bottomStats?: {
    label: string;
    value: string | number;
  }[];
}

export default function BankingExpensesCategories({ title, subheader, chart, bottomStats, ...other }: Props) {
  const theme = useTheme();

  const smUp = useResponsive('up', 'sm');

  const { colors, series, options } = chart;

  const chartSeries = series.map((i) => i.value);

  const chartOptions = useChart({
    colors,
    labels: series.map((i) => i.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    fill: {
      opacity: 0.8,
    },
    legend: {
      position: 'right',
      itemMargin: {
        horizontal: 10,
        vertical: 7,
      },
    },
    tooltip: {
      fillSeriesColor: false,
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          legend: {
            position: 'bottom',
            horizontalAlign: 'left',
          },
        },
      },
    ],
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box
        sx={{
          my: 5,
          '& .apexcharts-legend': {
            m: 'auto',
            height: { sm: 160 },
            flexWrap: { sm: 'wrap' },
            width: { xs: 240, sm: '50%' },
          },
          '& .apexcharts-datalabels-group': {
            display: 'none',
          },
        }}
      >
        <Chart
          dir="ltr"
          type="donut"
          series={chartSeries}
          options={chartOptions}
          height={smUp ? 240 : 360}
        />
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {bottomStats && bottomStats.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns={`repeat(${bottomStats.length}, 1fr)`}
          sx={{ textAlign: 'center', typography: 'h4' }}
        >
          {bottomStats.map((stat, index) => (
            <Stack
              key={stat.label}
              sx={{
                py: 2,
                borderRight: index < bottomStats.length - 1
                  ? `dashed 1px ${theme.palette.divider}`
                  : undefined,
              }}
            >
              <Box component="span" sx={{ mb: 1, typography: 'body2', color: 'text.secondary' }}>
                {stat.label}
              </Box>
              {stat.value}
            </Stack>
          ))}
        </Box>
      )}
    </Card>
  );
}
