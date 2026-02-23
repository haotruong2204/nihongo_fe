import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetUser, useGetUserResources } from 'src/api/user';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTable, TableNoData, TableSkeleton } from 'src/components/table';

// ----------------------------------------------------------------------

const RESOURCE_CONFIG: Record<string, string> = {
  srs_cards: 'SRS Cards',
  review_logs: 'Review Logs',
  custom_vocab_items: 'Custom Vocab',
  roadmap_day_progresses: 'Roadmap Progress',
  tango_lesson_progresses: 'Tango Lessons',
  jlpt_test_results: 'JLPT Tests',
};

// ----------------------------------------------------------------------

export default function UserResourceListView() {
  const settings = useSettingsContext();

  const { id = '', resource = '' } = useParams();

  const table = useTable({ defaultRowsPerPage: 10 });

  const { user, userLoading } = useGetUser(id);

  const { items, pagination, isLoading, isEmpty } = useGetUserResources(id, resource, {
    page: table.page + 1,
    perPage: table.rowsPerPage,
  });

  const resourceTitle = RESOURCE_CONFIG[resource] || resource;

  const columns = useMemo(() => {
    if (!items.length) return [];
    return Object.keys(items[0]);
  }, [items]);

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
        heading={resourceTitle}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.list },
          { name: user.display_name, href: paths.dashboard.user.analytics(id) },
          { name: resourceTitle },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 'bold' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  [...Array(table.rowsPerPage)].map((_, index) => (
                    <TableSkeleton key={index} sx={{ height: 56 }} />
                  ))
                ) : (
                  <>
                    {items.map((row) => (
                      <TableRow key={row.id} hover>
                        {columns.map((col) => (
                          <TableCell key={col}>
                            {(() => {
                              if (typeof row[col] === 'boolean') return row[col] ? 'Yes' : 'No';
                              if (row[col] != null) return String(row[col]);
                              return '-';
                            })()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                )}

                <TableNoData notFound={isEmpty} />
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
    </Container>
  );
}
