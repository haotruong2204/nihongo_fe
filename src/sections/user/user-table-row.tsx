// @mui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// types
import { IUserItem } from 'src/types/user';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const { id, display_name, photo_url, email, is_premium, is_banned, srs_cards_count, kanji_srs_cards_count, vocab_srs_cards_count, review_logs_count, page_views_count, tango_lesson_progresses_count, vocab_sets_count } = row;

  const router = useRouter();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={display_name} src={photo_url} sx={{ mr: 2 }} />

          <ListItemText
            primary={
              <Link
                color="inherit"
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(paths.dashboard.user.analytics(id))}
              >
                {display_name}
              </Link>
            }
            secondary={email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: is_premium ? 'warning.main' : 'text.disabled',
              fontWeight: is_premium ? 600 : 400,
            }}
          />
        </TableCell>

        <TableCell align="center">
          {kanji_srs_cards_count != null && vocab_srs_cards_count != null
            ? `${kanji_srs_cards_count} / ${vocab_srs_cards_count}`
            : (srs_cards_count ?? 0)}
        </TableCell>

        <TableCell align="center">
          {review_logs_count ?? 0}
        </TableCell>

        <TableCell align="center">
          {page_views_count ?? 0}
        </TableCell>

        <TableCell align="center">
          {tango_lesson_progresses_count ?? 0}
        </TableCell>

        <TableCell align="center">
          {vocab_sets_count ?? 0}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={is_banned ? 'error' : 'success'}
          >
            {is_banned ? 'Banned' : 'Active'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
