// @mui
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// types
import { IDevtoolsLogItem } from 'src/types/devtools-log';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: IDevtoolsLogItem;
  onViewRow: () => void;
  onBlockIp: (ip: string) => void;
  onUnblockIp: (blockedIpId: string, ip: string) => void;
};

function getCountColor(count: number): 'error' | 'warning' | 'default' {
  if (count >= 5) return 'error';
  if (count >= 2) return 'warning';
  return 'default';
}

export default function DevtoolsLogTableRow({ row, onViewRow, onBlockIp, onUnblockIp }: Props) {
  const { ip_address, email, open_count, country, city, is_blocked, blocked_ip_id, last_detected_at } = row;

  const location = [city, country].filter(Boolean).join(', ') || '-';

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={onViewRow}>
      <TableCell>
        <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace' }}>
          {ip_address}
        </Typography>
      </TableCell>

      <TableCell>
        {email || (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            Anonymous
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{location}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={getCountColor(open_count)}
        >
          {open_count}
        </Label>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={is_blocked ? 'error' : 'success'}>
          {is_blocked ? 'Blocked' : 'Active'}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {last_detected_at ? fDateTime(last_detected_at) : '-'}
        </Typography>
      </TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        {is_blocked ? (
          <Tooltip title="Unblock IP" placement="top" arrow>
            <IconButton
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                onUnblockIp(blocked_ip_id!, ip_address);
              }}
            >
              <Iconify icon="solar:shield-check-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Block IP" placement="top" arrow>
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onBlockIp(ip_address);
              }}
            >
              <Iconify icon="solar:shield-cross-bold" />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}
