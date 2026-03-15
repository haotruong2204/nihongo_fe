import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
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

interface SectionResult { label: string; correct: number; total: number; }

function JlptResultDialog({ row, open, onClose }: {
  row: Record<string, any> | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocales();
  if (!row) return null;

  const sections: SectionResult[] = Array.isArray(row.sections) ? row.sections : [];
  const pct = row.total_questions > 0
    ? Math.round((row.correct_count / row.total_questions) * 100)
    : 0;
  const minutes = row.time_used != null ? Math.floor(row.time_used / 60) : null;
  const seconds = row.time_used != null ? row.time_used % 60 : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Label variant="soft" color="primary" sx={{ fontSize: 14 }}>{row.level}</Label>
          {row.section && <Label variant="soft" color="default">{row.section}</Label>}
          {row.test_id && (
            <Typography variant="caption" color="text.secondary">{row.test_id}</Typography>
          )}
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Overall score */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              flex: 1, textAlign: 'center', p: 2, borderRadius: 1.5,
              bgcolor: row.passed ? 'success.lighter' : 'error.lighter',
            }}
          >
            <Typography variant="h3" color={row.passed ? 'success.dark' : 'error.dark'}>
              {row.correct_count ?? '-'}<Typography component="span" variant="h6" color="text.secondary"> / {row.total_questions}</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">câu đúng</Typography>
          </Box>

          <Stack spacing={1} sx={{ flex: 1 }}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">Kết quả</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Label variant="soft" color={row.passed ? 'success' : 'error'} sx={{ fontSize: 13 }}>
                  {row.passed ? t('col_passed') : t('jlpt_failed')}
                </Label>
              </Box>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">Thời gian</Typography>
              <Typography variant="body2" fontWeight={600}>
                {minutes != null ? `${minutes}p ${seconds}s` : '-'}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Progress bar overall */}
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">Tổng điểm</Typography>
            <Typography variant="caption" fontWeight={600}>{pct}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={pct}
            color={row.passed ? 'success' : 'error'}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Stack>

        {/* Per-section breakdown */}
        {sections.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Chi tiết theo phần</Typography>
            <Stack spacing={1.5}>
              {sections.map((s) => {
                const sPct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                let sColor: 'success' | 'warning' | 'error' = 'error';
                if (sPct >= 60) sColor = 'success';
                else if (sPct >= 40) sColor = 'warning';
                return (
                  <Stack key={s.label} spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{s.label}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {s.correct} / {s.total} câu
                        </Typography>
                        <Label variant="soft" color={sColor} sx={{ minWidth: 40, justifyContent: 'center', fontSize: 11 }}>
                          {sPct}%
                        </Label>
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={sPct}
                      color={sColor}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </>
        )}

        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
          {row.taken_at ? fDateTime(row.taken_at) : ''}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export default function UserJlptTestResultsView() {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { id = '' } = useParams();

  const table = useTable({ defaultRowsPerPage: 10 });
  const [levelFilter, setLevelFilter] = useState('');
  const [passedFilter, setPassedFilter] = useState('');
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);

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
        <Stack
          direction="row"
          alignItems="center"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={levelFilter}
            onChange={handleLevelTabChange}
            sx={{ flex: 1, px: 2.5 }}
          >
            {LEVEL_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.labelKey ? t(tab.labelKey) : tab.label}
              />
            ))}
          </Tabs>

          <Select
            size="small"
            value={passedFilter}
            onChange={(e) => { setPassedFilter(e.target.value); table.onResetPage(); }}
            sx={{ mr: 2.5, minWidth: 120, fontSize: 13 }}
            displayEmpty
          >
            {PASSED_TABS.map((tab) => (
              <MenuItem key={tab.value} value={tab.value} sx={{ fontSize: 13 }}>
                {t(tab.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('col_id')}</TableCell>
                  <TableCell>{t('col_test_level')}</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Test ID</TableCell>
                  <TableCell align="center">{t('col_correct')}</TableCell>
                  <TableCell align="center">{t('col_total')}</TableCell>
                  <TableCell align="center">{t('col_duration')}</TableCell>
                  <TableCell align="center">{t('col_passed')}</TableCell>
                  <TableCell>{t('col_test_date')}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading
                  ? [...Array(table.rowsPerPage)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 56 }} />
                    ))
                  : items.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => setSelectedRow(row)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{row.id ?? '-'}</TableCell>

                        <TableCell>
                          {row.level ? (
                            <Label variant="soft" color="primary">
                              {row.level}
                            </Label>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        <TableCell>{row.section ?? '-'}</TableCell>

                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {row.test_id ?? '-'}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          {row.correct_count != null && row.incorrect_count != null
                            ? `${row.correct_count} / ${row.correct_count + row.incorrect_count}`
                            : '-'}
                        </TableCell>

                        <TableCell align="center">{row.total_questions ?? '-'}</TableCell>

                        <TableCell align="center">
                          {row.time_used != null ? `${row.time_used}s` : '-'}
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
                          {row.taken_at ? fDateTime(row.taken_at) : '-'}
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

      <JlptResultDialog
        row={selectedRow}
        open={!!selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </Container>
  );
}
