import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { IDevtoolsLogItem } from 'src/types/devtools-log';
// utils
import { fDateTime } from 'src/utils/format-time';
// api
import { useGetDevtoolsLogs, blockIp, unblockIp } from 'src/api/devtools-log';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSkeleton,
  TablePaginationCustom,
} from 'src/components/table';
//
import DevtoolsLogTableRow from '../devtools-log-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ip_address', label: 'IP Address', width: 160 },
  { id: 'email', label: 'Email' },
  { id: 'country', label: 'Location', width: 160 },
  { id: 'open_count', label: 'Count', width: 100 },
  { id: '', label: 'Status', width: 100 },
  { id: '', width: 64 },
];

// ----------------------------------------------------------------------

export default function DevtoolsLogListView() {
  const table = useTable({
    defaultRowsPerPage: 20,
    defaultOrderBy: 'last_detected_at',
    defaultOrder: 'desc',
    defaultDense: true,
  });

  const settings = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();

  const confirmBlock = useBoolean();
  const confirmUnblock = useBoolean();
  const viewDetail = useBoolean();

  const [search, setSearch] = useState('');
  const [blockTarget, setBlockTarget] = useState('');
  const [unblockTarget, setUnblockTarget] = useState({ id: '', ip: '' });
  const [selectedRow, setSelectedRow] = useState<IDevtoolsLogItem | null>(null);

  const { logs, pagination, logsLoading, logsEmpty, logsMutate } = useGetDevtoolsLogs({
    page: table.page + 1,
    perPage: table.rowsPerPage,
    search,
    sortBy: table.orderBy,
    sortOrder: table.order,
  });

  const handleViewRow = useCallback(
    (row: IDevtoolsLogItem) => {
      setSelectedRow(row);
      viewDetail.onTrue();
    },
    [viewDetail]
  );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.onResetPage();
      setSearch(event.target.value);
    },
    [table]
  );

  const handleBlockIp = useCallback(
    (ip: string) => {
      setBlockTarget(ip);
      confirmBlock.onTrue();
    },
    [confirmBlock]
  );

  const handleUnblockIp = useCallback(
    (blockedIpId: string, ip: string) => {
      setUnblockTarget({ id: blockedIpId, ip });
      confirmUnblock.onTrue();
    },
    [confirmUnblock]
  );

  const handleConfirmBlock = useCallback(async () => {
    try {
      await blockIp(blockTarget);
      enqueueSnackbar(`IP ${blockTarget} has been blocked!`);
      confirmBlock.onFalse();
      setBlockTarget('');
      logsMutate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to block IP', { variant: 'error' });
    }
  }, [blockTarget, confirmBlock, enqueueSnackbar, logsMutate]);

  const handleConfirmUnblock = useCallback(async () => {
    try {
      await unblockIp(unblockTarget.id);
      enqueueSnackbar(`IP ${unblockTarget.ip} has been unblocked!`);
      confirmUnblock.onFalse();
      setUnblockTarget({ id: '', ip: '' });
      logsMutate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to unblock IP', { variant: 'error' });
    }
  }, [unblockTarget, confirmUnblock, enqueueSnackbar, logsMutate]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="DevTools Logs"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'DevTools Logs' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
          >
            <TextField
              fullWidth
              value={search}
              onChange={handleSearch}
              placeholder="Search by IP or email..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 720 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={table.onSort}
                />

                <TableBody>
                  {logsLoading ? (
                    [...Array(table.rowsPerPage)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 60 }} />
                    ))
                  ) : (
                    <>
                      {logs.map((row) => (
                        <DevtoolsLogTableRow
                          key={row.id}
                          row={row}
                          onViewRow={() => handleViewRow(row)}
                          onBlockIp={handleBlockIp}
                          onUnblockIp={handleUnblockIp}
                        />
                      ))}
                    </>
                  )}

                  <TableNoData notFound={logsEmpty} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={pagination.total_count}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmBlock.value}
        onClose={confirmBlock.onFalse}
        title="Block IP"
        content={
          <>
            Are you sure you want to block <strong>{blockTarget}</strong>?
            <br />
            This IP will be blocked from all API endpoints.
            If a user account is linked, it will also be banned.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmBlock}>
            Block
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmUnblock.value}
        onClose={confirmUnblock.onFalse}
        title="Unblock IP"
        content={
          <>
            Unblock <strong>{unblockTarget.ip}</strong>?
            <br />
            Note: If the user was banned, you need to unban them separately.
          </>
        }
        action={
          <Button variant="contained" color="success" onClick={handleConfirmUnblock}>
            Unblock
          </Button>
        }
      />

      <Dialog open={viewDetail.value} onClose={viewDetail.onFalse} maxWidth="sm" fullWidth>
        <DialogTitle>Log Detail</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <DetailRow label="IP Address" value={selectedRow.ip_address} mono />
              <DetailRow label="Email" value={selectedRow.email || 'Anonymous'} />
              <DetailRow label="Location" value={[selectedRow.city, selectedRow.country].filter(Boolean).join(', ') || '-'} />
              <DetailRow label="User Agent" value={selectedRow.user_agent || '-'} />
              <DetailRow label="Open Count" value={String(selectedRow.open_count)} />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Status
                </Typography>
                <Label variant="soft" color={selectedRow.is_blocked ? 'error' : 'success'}>
                  {selectedRow.is_blocked ? 'Blocked' : 'Active'}
                </Label>
              </Box>
              <DetailRow label="Last Detected" value={selectedRow.last_detected_at ? fDateTime(selectedRow.last_detected_at) : '-'} />
              <DetailRow label="First Detected" value={selectedRow.created_at ? fDateTime(selectedRow.created_at) : '-'} />
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={mono ? { fontFamily: 'monospace' } : undefined}>
        {value}
      </Typography>
    </Box>
  );
}
