import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
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
import { useGetUser, useGetUserResources, deleteCustomVocabItem } from 'src/api/user';
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
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTable, TableNoData, TableSkeleton } from 'src/components/table';

// ----------------------------------------------------------------------

export default function UserCustomVocabView() {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { id = '' } = useParams();

  const table = useTable({ defaultRowsPerPage: 10 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const confirmDialog = useBoolean();

  const { user, userLoading } = useGetUser(id);
  const { items, pagination, isLoading, isEmpty, mutate } = useGetUserResources(
    id,
    'custom_vocab_items',
    { page: table.page + 1, perPage: table.rowsPerPage }
  );

  const handleOpenDelete = useCallback(
    (itemId: string) => {
      setDeleteId(itemId);
      confirmDialog.onTrue();
    },
    [confirmDialog]
  );

  const handleCloseDelete = useCallback(() => {
    confirmDialog.onFalse();
    setDeleteId(null);
  }, [confirmDialog]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteCustomVocabItem(id, deleteId);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      handleCloseDelete();
    }
  }, [deleteId, id, mutate, handleCloseDelete]);

  if (userLoading) return <LoadingScreen />;

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
        heading={t('custom_vocab')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('user'), href: paths.dashboard.user.list },
          { name: user.display_name, href: paths.dashboard.user.analytics(id) },
          { name: t('custom_vocab') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('col_word')}</TableCell>
                  <TableCell>{t('col_reading')}</TableCell>
                  <TableCell>Hán Việt</TableCell>
                  <TableCell>{t('col_meaning')}</TableCell>
                  <TableCell>{t('col_created_at')}</TableCell>
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
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {row.word ?? '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {row.reading ?? '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="primary.main">
                            {row.hanviet ? String(row.hanviet).toUpperCase() : '—'}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 260, whiteSpace: 'pre-wrap' }}>
                          {row.meaning ?? '-'}
                        </TableCell>

                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {row.created_at ? fDateTime(row.created_at) : '-'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title={t('delete')} arrow placement="top">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDelete(row.id)}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Tooltip>
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
        onClose={handleCloseDelete}
        title={t('delete')}
        content={t('srs_delete_confirm_content')}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            {t('delete')}
          </Button>
        }
      />
    </Container>
  );
}
