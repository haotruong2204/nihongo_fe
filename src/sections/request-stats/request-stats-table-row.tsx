// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
// types
import { IRequestStatItem } from 'src/types/request-stats';

// ----------------------------------------------------------------------

type Props = {
  row: IRequestStatItem;
  onViewRealtime: VoidFunction;
};

export default function RequestStatsTableRow({ row, onViewRealtime }: Props) {
  const { user_id, date, total_requests, endpoint_stats, flagged, flag_reason } = row;

  const router = useRouter();

  // Get top 3 endpoints by count
  const topEndpoints = Object.entries(endpoint_stats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <TableRow hover>
      <TableCell>
        <Link
          color="inherit"
          sx={{ cursor: 'pointer', fontWeight: 600 }}
          onClick={() => router.push(paths.dashboard.user.analytics(String(user_id)))}
        >
          #{user_id}
        </Link>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{date}</TableCell>

      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {total_requests.toLocaleString()}
        </Typography>
      </TableCell>

      <TableCell>
        {topEndpoints.length > 0 ? (
          topEndpoints.map(([endpoint, count]) => (
            <Typography key={endpoint} variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              {endpoint}: <strong>{count}</strong>
            </Typography>
          ))
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>-</Typography>
        )}
      </TableCell>

      <TableCell>
        <Label variant="soft" color={flagged ? 'error' : 'success'}>
          {flagged ? 'Flagged' : 'OK'}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {flag_reason || '-'}
        </Typography>
      </TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        <Tooltip title="View Realtime" placement="top" arrow>
          <IconButton onClick={onViewRealtime}>
            <Iconify icon="solar:monitor-smartphone-bold-duotone" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
