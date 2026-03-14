import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import { useGetUser, useGetUserJlptTestResults } from 'src/api/user';
// locales
import { useLocales } from 'src/locales';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTable, TableNoData, TableSkeleton } from 'src/components/table';

// ----------------------------------------------------------------------

const LEVEL_TABS = [
  { value: '', labelKey: 'all' },
  { value: 'N1', label: 'N1' },
  { value: 'N2', label: 'N2' },
  { value: 'N3', label: 'N3' },
  { value: 'N4', label: 'N4' },
  { value: 'N5', label: 'N5' },
];

const PASSED_TABS = [
  { value: '', labelKey: 'all' },
  { value: 'true', labelKey: 'col_passed' },
  { value: 'false', labelKey: 'jlpt_failed' },
];

// ----------------------------------------------------------------------

export default function UserJlptTestResultsView() {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { id = '' } = useParams();

  const table = useTable({ defaultRowsPerPage: 10 });
  const [levelFilter, setLevelFilter] = useState('');
  const [passedFilter, setPassedFilter] = useState('');

  const { user, userLoading } = useGetUser(id);
  const { items, pagination, isLoading, isEmpty, error } = useGetUserJlptTestResults(id, {
    page: table.page + 1,
    perPage: table.rowsPerPage,
    level: levelFilter,
    passed: passedFilter,
  });

  const handleLevelTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      setLevelFilter(newValue);
      table.onResetPage();
    },
    [table]
  );

  const handlePassedTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      setPassedFilter(newValue);
      table.onResetPage();
    },
    [table]
  );

  if (userLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h6">{t('user_not_found')}</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading={t('jlpt_tests')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('user'), href: paths.dashboard.user.list },
            { name: user.display_name, href: paths.dashboard.user.analytics(id) },
            { name: t('jlpt_tests') },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Typography variant="body2" color="text.secondary">
          {t('not_updated')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('jlpt_tests')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('user'), href: paths.dashboard.user.list },
          { name: user.display_name, href: paths.dashboard.user.analytics(id) },
          { name: t('jlpt_tests') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {/* Level filter */}
        <Tabs
          value={levelFilter}
          onChange={handleLevelTabChange}
          sx={{ px: 2.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {LEVEL_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.labelKey ? t(tab.labelKey) : tab.label}
            />
          ))}
        </Tabs>

        {/* Passed filter */}
        <Tabs
          value={passedFilter}
          onChange={handlePassedTabChange}
          sx={{ px: 2.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {PASSED_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={t(tab.labelKey)} />
          ))}
        </Tabs>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('col_id')}</TableCell>
                  <TableCell>{t('col_test_level')}</TableCell>
                  <TableCell>{t('col_test_date')}</TableCell>
                  <TableCell align="center">{t('col_score')}</TableCell>
                  <TableCell align="center">{t('col_total')}</TableCell>
                  <TableCell align="center">{t('col_correct')}</TableCell>
                  <TableCell align="center">{t('col_duration')}</TableCell>
                  <TableCell align="center">{t('col_passed')}</TableCell>
                  <TableCell>{t('col_created_at')}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading
                  ? [...Array(table.rowsPerPage)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 56 }} />
                    ))
                  : items.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id ?? '-'}</TableCell>

                        <TableCell>
                          {row.test_level ? (
                            <Label variant="soft" color="primary">
                              {row.test_level}
                            </Label>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.test_date ? fDateTime(row.test_date) : '-'}
                        </TableCell>

                        <TableCell align="center">{row.score ?? '-'}</TableCell>

                        <TableCell align="center">{row.total ?? '-'}</TableCell>

                        <TableCell align="center">{row.correct ?? '-'}</TableCell>

                        <TableCell align="center">
                          {row.duration != null ? `${row.duration}s` : '-'}
                        </TableCell>

                        <TableCell align="center">
                          {row.passed != null ? (
                            <Label
                              variant="soft"
                              color={row.passed ? 'success' : 'error'}
                            >
                              {row.passed ? t('col_passed') : t('jlpt_failed')}
                            </Label>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.created_at ? fDateTime(row.created_at) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}

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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Container>
  );
}
