import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetUser, useGetUserResources, deleteVocabSet, removeVocabSetItem } from 'src/api/user';
// locales
import { useLocales } from 'src/locales';
// utils
import { fDateTime } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTable, TableSkeleton } from 'src/components/table';

// ----------------------------------------------------------------------

export default function UserVocabSetsView() {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { id = '' } = useParams();

  const table = useTable({ defaultRowsPerPage: 10 });
  const confirmDialog = useBoolean();

  const [pendingDeleteSet, setPendingDeleteSet] = useState<string | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{ setId: string; index: number } | null>(null);

  const { user, userLoading } = useGetUser(id);
  const { items, pagination, isLoading, isEmpty, error, mutate } = useGetUserResources(
    id,
    'vocab_sets',
    { page: table.page + 1, perPage: table.rowsPerPage }
  );

  const handleOpenDeleteSet = useCallback(
    (e: React.MouseEvent, setId: string) => {
      e.stopPropagation();
      setPendingDeleteSet(setId);
      setPendingDeleteItem(null);
      confirmDialog.onTrue();
    },
    [confirmDialog]
  );

  const handleOpenDeleteItem = useCallback(
    (setId: string, index: number) => {
      setPendingDeleteItem({ setId, index });
      setPendingDeleteSet(null);
      confirmDialog.onTrue();
    },
    [confirmDialog]
  );

  const handleCloseConfirm = useCallback(() => {
    confirmDialog.onFalse();
    setPendingDeleteSet(null);
    setPendingDeleteItem(null);
  }, [confirmDialog]);

  const handleConfirm = useCallback(async () => {
    try {
      if (pendingDeleteSet) {
        await deleteVocabSet(id, pendingDeleteSet);
      } else if (pendingDeleteItem) {
        await removeVocabSetItem(id, pendingDeleteItem.setId, pendingDeleteItem.index);
      }
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      handleCloseConfirm();
    }
  }, [id, pendingDeleteSet, pendingDeleteItem, mutate, handleCloseConfirm]);

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
          heading={t('vocab_sets')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('user'), href: paths.dashboard.user.list },
            { name: user.display_name, href: paths.dashboard.user.analytics(id) },
            { name: t('vocab_sets') },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Typography variant="body2" color="text.secondary">{t('not_updated')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('vocab_sets')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('user'), href: paths.dashboard.user.list },
          { name: user.display_name, href: paths.dashboard.user.analytics(id) },
          { name: t('vocab_sets') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Stack spacing={2}>
          {[...Array(3)].map((_, i) => (
            <TableSkeleton key={i} sx={{ height: 80, borderRadius: 1 }} />
          ))}
        </Stack>
      )}

      {!isLoading && isEmpty && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('not_updated')}
          </Typography>
        </Card>
      )}

      {!isLoading && !isEmpty && (
        <Stack spacing={2}>
          {items.map((set) => {
            const vocabItems: Array<Record<string, string>> = Array.isArray(set.items)
              ? set.items
              : [];

            return (
              <Accordion key={set.id} defaultExpanded={items.length === 1}>
                <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, pr: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {set.name ?? t('not_updated')}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${vocabItems.length} ${t('col_word').toLowerCase()}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Box sx={{ flex: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {set.created_at ? fDateTime(set.created_at) : ''}
                    </Typography>
                    <Tooltip title={t('delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleOpenDeleteSet(e, set.id)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0 }}>
                  {vocabItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('not_updated')}
                    </Typography>
                  ) : (
                    <Scrollbar>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: 40 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('col_word')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('col_reading')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Hán Việt</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('col_meaning')}</TableCell>
                            <TableCell sx={{ width: 40 }} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vocabItems.map((item, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {idx + 1}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.word ?? '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {item.reading ?? '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary.main">
                                  {item.hanviet ? item.hanviet.toUpperCase() : '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>{item.meaning ?? '-'}</TableCell>
                              <TableCell>
                                <Tooltip title={t('delete')}>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDeleteItem(set.id, idx)}
                                  >
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}

      {!isLoading && !isEmpty && pagination && (
        <TablePagination
          component="div"
          count={pagination.total_count}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ mt: 2 }}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={handleCloseConfirm}
        title={t('delete')}
        content={pendingDeleteSet ? t('vocab_set_delete_confirm') : t('vocab_item_delete_confirm')}
        action={
          <Button variant="contained" color="error" onClick={handleConfirm}>
            {t('delete')}
          </Button>
        }
      />
    </Container>
  );
}
