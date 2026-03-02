import { useEffect, useState, useCallback } from 'react';
// @mui
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
// components
import Iconify from 'src/components/iconify';
// api
import { getRealtimeStats } from 'src/api/request-stats';
// types
import { IRequestStatRealtime } from 'src/types/request-stats';

// ----------------------------------------------------------------------

type Props = {
  userId: string | null;
  onClose: VoidFunction;
};

export default function RequestStatsRealtimeDialog({ userId, onClose }: Props) {
  const [data, setData] = useState<IRequestStatRealtime | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const result = await getRealtimeStats(userId);
    setData(result);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    } else {
      setData(null);
    }
  }, [userId, fetchData]);

  const endpoints = Object.entries(data?.endpoint_stats || {}).sort(([, a], [, b]) => b - a);

  return (
    <Dialog open={!!userId} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:monitor-smartphone-bold-duotone" />
        Realtime — User #{userId}
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        )}

        {!loading && !data && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No data available for this user today.
          </Typography>
        )}

        {!loading && data && (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography variant="body2">{data.date}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" color="text.secondary">Total Requests</Typography>
              <Typography variant="h4">{data.total_requests.toLocaleString()}</Typography>
            </Stack>

            {endpoints.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {endpoints.map(([endpoint, count]) => (
                      <TableRow key={endpoint}>
                        <TableCell>
                          <Typography variant="caption">{endpoint}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>{count}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={fetchData} startIcon={<Iconify icon="solar:refresh-bold" />}>
          Refresh
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
