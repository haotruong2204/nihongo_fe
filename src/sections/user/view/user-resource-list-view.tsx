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
// locales
import { useLocales } from 'src/locales';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTable, TableNoData, TableSkeleton } from 'src/components/table';

// ----------------------------------------------------------------------

const RESOURCE_I18N_KEY: Record<string, string> = {
  srs_cards: 'srs_cards',
  review_logs: 'review_logs',
  custom_vocab_items: 'custom_vocab',
  roadmap_day_progresses: 'roadmap_progress',
  tango_lesson_progresses: 'tango_lessons',
  jlpt_test_results: 'jlpt_tests',
  login_activities: 'login_activities',
};

function isDateColumn(col: string): boolean {
  return /(_(at|date|time|until|on)$|created|updated)/i.test(col);
}

function formatColumnHeader(col: string, t: (key: string) => string): string {
  const key = `col_${col}`;
  const translated = t(key);
  // If i18next returns the key itself, fallback to formatted column name
  if (translated === key) {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return translated;
}

function formatCellValue(col: string, value: unknown, t: (key: string) => string): string {
  if (typeof value === 'boolean') return value ? t('yes') : t('no');
  if (value == null) return '-';
  if (isDateColumn(col) && typeof value === 'string' && value.length > 0) {
    const formatted = fDateTime(value);
    return formatted || String(value);
  }
  return String(value);
}

// ----------------------------------------------------------------------

export default function UserResourceListView() {
  const settings = useSettingsContext();

  const { t } = useLocales();

  const { id = '', resource = '' } = useParams();

  const table = useTable({ defaultRowsPerPage: 10 });

  const { user, userLoading } = useGetUser(id);

  const { items, pagination, isLoading, isEmpty } = useGetUserResources(id, resource, {
    page: table.page + 1,
    perPage: table.rowsPerPage,
  });

  const resourceKey = RESOURCE_I18N_KEY[resource];
  const resourceTitle = resourceKey ? t(resourceKey) : resource;

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
        <Typography variant="h6">{t('user_not_found')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={resourceTitle}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('user'), href: paths.dashboard.user.list },
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
                      {formatColumnHeader(col, t)}
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
                            {formatCellValue(col, row[col], t)}
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
