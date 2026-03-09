import { ApexOptions } from 'apexcharts';
// @mui
import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
// utils
import { fNumber } from 'src/utils/format-number';
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
}

export default function AnalyticsConversionRates({ title, subheader, chart, ...other }: Props) {
  const { colors, series, options } = chart;
  const theme = useTheme();

  const PINNED_COUNT = 2;
  const PINNED_COLOR = theme.palette.warning.main;

  const chartSeries = series.map((i) => i.value);

  const barColors = series.map((_, idx) =>
    idx >= series.length - PINNED_COUNT ? PINNED_COLOR : (colors?.[0] ?? '#00A76F')
  );

  const chartOptions = useChart({
    colors: barColors,
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '28%',
        borderRadius: 2,
        distributed: true,
      },
    },
    legend: { show: false },
    xaxis: {
      categories: series.map((i) => i.label),
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ mx: 3 }}>
        <Chart
          type="bar"
          dir="ltr"
          series={[{ data: chartSeries }]}
          options={chartOptions}
          height={Math.max(364, series.length * 40)}
        />
      </Box>
    </Card>
  );
}
