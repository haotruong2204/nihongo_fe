import isEqual from 'lodash/isEqual';
import { useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetRequestStats, useGetRequestStatsSummary } from 'src/api/request-stats';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSkeleton,
} from 'src/components/table';
// types
import { IRequestStatFilters, IRequestStatFilterValue } from 'src/types/request-stats';
//
import RequestStatsTableRow from '../request-stats-table-row';
import RequestStatsToolbar from '../request-stats-toolbar';
import RequestStatsSummaryCards from '../request-stats-summary-cards';
import RequestStatsRealtimeDialog from '../request-stats-realtime-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user_id', label: 'User ID', width: 100 },
  { id: 'date', label: 'Date', width: 120 },
  { id: 'total_requests', label: 'Total Requests', width: 140 },
  { id: 'top_endpoints', label: 'Top Endpoints' },
  { id: 'flagged', label: 'Flagged', width: 100 },
  { id: 'flag_reason', label: 'Reason', width: 200 },
  { id: '', width: 68 },
];

const defaultFilters: IRequestStatFilters = {
  search: '',
  flagged: 'all',
};

// ----------------------------------------------------------------------

export default function RequestStatsView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const [filters, setFilters] = useState(defaultFilters);

  const [realtimeUserId, setRealtimeUserId] = useState<string | null>(null);

  const { stats, pagination, statsLoading, statsEmpty } = useGetRequestStats({
    page: table.page + 1,
    perPage: table.rowsPerPage,
    search: filters.search,
    flagged: filters.flagged,
  });

  const { summary, summaryLoading } = useGetRequestStatsSummary();

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = statsEmpty && canReset;

  const handleFilters = useCallback(
    (name: string, value: IRequestStatFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Request Stats"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Request Stats' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RequestStatsSummaryCards summary={summary} loading={summaryLoading} />

      <Card sx={{ mt: 3 }}>
        <RequestStatsToolbar
          filters={filters}
          onFilters={handleFilters}
          onResetFilters={handleResetFilters}
          canReset={canReset}
          onViewRealtime={(userId) => setRealtimeUserId(userId)}
        />

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
                {statsLoading ? (
                  [...Array(table.rowsPerPage)].map((_, index) => (
                    <TableSkeleton key={index} sx={{ height: 72 }} />
                  ))
                ) : (
                  <>
                    {stats.map((row) => (
                      <RequestStatsTableRow
                        key={row.id}
                        row={row}
                        onViewRealtime={() => setRealtimeUserId(String(row.user_id))}
                      />
                    ))}
                  </>
                )}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination.total_count}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <RequestStatsRealtimeDialog
        userId={realtimeUserId}
        onClose={() => setRealtimeUserId(null)}
      />
    </Container>
  );
}
