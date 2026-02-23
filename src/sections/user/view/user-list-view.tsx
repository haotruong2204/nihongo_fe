import isEqual from 'lodash/isEqual';
import { useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetUsers, deleteUser } from 'src/api/user';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TableSkeleton,
} from 'src/components/table';
// types
import { IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
//
import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'display_name', label: 'User' },
  { id: 'is_premium', label: 'Premium', width: 140 },
  { id: 'is_banned', label: 'Status', width: 120 },
  { id: 'premium_until', label: 'Premium Until', width: 180 },
  { id: 'last_login_at', label: 'Last Login', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters: IUserTableFilters = {
  search: '',
  isPremium: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState(defaultFilters);

  const { users, pagination, usersLoading, usersEmpty, usersMutate } = useGetUsers({
    page: table.page + 1, // MUI is 0-based, API is 1-based
    perPage: table.rowsPerPage,
    search: filters.search,
    isPremium: filters.isPremium,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = usersEmpty && canReset;

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteUser(id);
        enqueueSnackbar('Delete success!');
        usersMutate();
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Delete failed!', { variant: 'error' });
      }
    },
    [enqueueSnackbar, usersMutate]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => deleteUser(id)));
      enqueueSnackbar('Delete success!');
      table.setSelected([]);
      usersMutate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Delete failed!', { variant: 'error' });
    }
  }, [enqueueSnackbar, table, usersMutate]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'User', href: paths.dashboard.user.root },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={pagination.total_count}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={users.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  users.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={users.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      users.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {usersLoading ? (
                    [...Array(table.rowsPerPage)].map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 72 }} />
                    ))
                  ) : (
                    <>
                      {users.map((row) => (
                        <UserTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
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
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
