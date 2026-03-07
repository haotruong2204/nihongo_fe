import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetUser, useGetUserSrsCards, deleteSrsCard, resetSrsCard } from 'src/api/user';
// locales
import { useLocales } from 'src/locales';
// utils
import { fDateTime } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTable, TableNoData, TableSkeleton } from 'src/components/table';

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: '', labelKey: 'all' },
  { value: 'new', labelKey: 'srs_status_new' },
  { value: 'learning', labelKey: 'srs_status_learning' },
  { value: 'review', labelKey: 'srs_status_review' },
  { value: 'overdue', labelKey: 'srs_status_overdue' },
];

type SrsStatusColor = 'default' | 'info' | 'success' | 'error' | 'warning' | 'primary' | 'secondary';

const STATUS_COLORS: Record<string, SrsStatusColor> = {
  new: 'default',
  learning: 'info',
  review: 'success',
  relearning: 'warning',
  overdue: 'error',
};

// ----------------------------------------------------------------------

type ActionTarget = { id: string; type: 'delete' | 'reset' } | null;

export default function UserSrsCardsView() {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { id = '' } = useParams();

  const table = useTable({ defaultRowsPerPage: 10 });
  const [statusFilter, setStatusFilter] = useState('');
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const confirmDialog = useBoolean();

  const { user, userLoading } = useGetUser(id);
  const { items, pagination, isLoading, isEmpty, mutate } = useGetUserSrsCards(id, {
    page: table.page + 1,
    perPage: table.rowsPerPage,
    status: statusFilter,
  });

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      setStatusFilter(newValue);
      table.onResetPage();
    },
    [table]
  );

  const handleOpenConfirm = useCallback(
    (cardId: string, type: 'delete' | 'reset') => {
      setActionTarget({ id: cardId, type });
      confirmDialog.onTrue();
    },
    [confirmDialog]
  );

  const handleCloseConfirm = useCallback(() => {
    confirmDialog.onFalse();
    setActionTarget(null);
  }, [confirmDialog]);

  const handleConfirmAction = useCallback(async () => {
    if (!actionTarget) return;
    try {
      if (actionTarget.type === 'delete') {
        await deleteSrsCard(id, actionTarget.id);
      } else {
        await resetSrsCard(id, actionTarget.id);
      }
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      handleCloseConfirm();
    }
  }, [actionTarget, id, mutate, handleCloseConfirm]);

  if (userLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h6">{t('user_not_found')}</Typography>
      </Container>
    );
  }

  const isDeleteAction = actionTarget?.type === 'delete';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('srs_cards')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('user'), href: paths.dashboard.user.list },
          { name: user.display_name, href: paths.dashboard.user.analytics(id) },
          { name: t('srs_cards') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={statusFilter}
          onChange={handleTabChange}
          sx={{ px: 2.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={t(tab.labelKey)} />
          ))}
        </Tabs>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('col_front')}</TableCell>
                  <TableCell>{t('col_back')}</TableCell>
                  <TableCell>{t('col_status')}</TableCell>
                  <TableCell align="center">{t('col_interval')}</TableCell>
                  <TableCell align="center">{t('col_ease_factor')}</TableCell>
                  <TableCell align="center">{t('col_reviews_count')}</TableCell>
                  <TableCell align="center">{t('col_lapses_count')}</TableCell>
                  <TableCell>{t('col_due_date')}</TableCell>
                  <TableCell align="right">{t('srs_actions')}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading
                  ? [...Array(table.rowsPerPage)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 56 }} />
                    ))
                  : items.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.front ?? '-'}
                        </TableCell>

                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.back ?? '-'}
                        </TableCell>

                        <TableCell>
                          {row.status ? (
                            <Label
                              variant="soft"
                              color={STATUS_COLORS[row.status] ?? 'default'}
                            >
                              {t(`srs_status_${row.status}`) !== `srs_status_${row.status}`
                                ? t(`srs_status_${row.status}`)
                                : row.status}
                            </Label>
                          ) : '-'}
                        </TableCell>

                        <TableCell align="center">
                          {row.interval != null ? (
                            <Chip
                              size="small"
                              label={`${row.interval}d`}
                              variant="outlined"
                            />
                          ) : '-'}
                        </TableCell>

                        <TableCell align="center">
                          {row.ease_factor != null
                            ? Number(row.ease_factor).toFixed(2)
                            : '-'}
                        </TableCell>

                        <TableCell align="center">
                          {row.reviews_count ?? row.review_count ?? 0}
                        </TableCell>

                        <TableCell align="center">
                          {row.lapses_count ?? 0}
                        </TableCell>

                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.due_date ? fDateTime(row.due_date) : '-'}
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                            <Tooltip title={t('srs_reset')} arrow placement="top">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleOpenConfirm(row.id, 'reset')}
                              >
                                <Iconify icon="solar:restart-bold" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('delete')} arrow placement="top">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenConfirm(row.id, 'delete')}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
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

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={handleCloseConfirm}
        title={isDeleteAction ? t('delete') : t('srs_reset')}
        content={
          isDeleteAction ? t('srs_delete_confirm_content') : t('srs_reset_confirm_content')
        }
        action={
          <Button
            variant="contained"
            color={isDeleteAction ? 'error' : 'warning'}
            onClick={handleConfirmAction}
          >
            {isDeleteAction ? t('delete') : t('srs_reset')}
          </Button>
        }
      />
    </Container>
  );
}
