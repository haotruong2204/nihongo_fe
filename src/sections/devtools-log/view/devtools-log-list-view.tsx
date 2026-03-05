import { useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetDevtoolsLogs } from 'src/api/devtools-log';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
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
  { id: 'user_agent', label: 'Browser' },
  { id: 'open_count', label: 'Count', width: 100 },
  { id: 'last_detected_at', label: 'Last Detected', width: 200 },
  { id: 'created_at', label: 'First Detected', width: 200 },
];

// ----------------------------------------------------------------------

export default function DevtoolsLogListView() {
  const table = useTable({
    defaultRowsPerPage: 20,
    defaultOrderBy: 'last_detected_at',
    defaultOrder: 'desc',
  });

  const settings = useSettingsContext();

  const [search, setSearch] = useState('');

  const { logs, pagination, logsLoading, logsEmpty } = useGetDevtoolsLogs({
    page: table.page + 1,
    perPage: table.rowsPerPage,
    search,
    sortBy: table.orderBy,
    sortOrder: table.order,
  });

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.onResetPage();
      setSearch(event.target.value);
    },
    [table]
  );

  return (
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                      <DevtoolsLogTableRow key={row.id} row={row} />
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
  );
}
