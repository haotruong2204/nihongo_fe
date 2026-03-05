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
  onBlockIp: (ip: string) => void;
  onUnblockIp: (blockedIpId: string, ip: string) => void;
};

function parseBrowser(ua: string | null): string {
  if (!ua) return '-';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

function parseOS(ua: string | null): string {
  if (!ua) return '';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS') || ua.includes('Macintosh')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return '';
}

function getCountColor(count: number): 'error' | 'warning' | 'default' {
  if (count >= 5) return 'error';
  if (count >= 2) return 'warning';
  return 'default';
}

export default function DevtoolsLogTableRow({ row, onBlockIp, onUnblockIp }: Props) {
  const { ip_address, email, user_agent, open_count, country, city, last_detected_at, created_at, is_blocked, blocked_ip_id } = row;

  const location = [city, country].filter(Boolean).join(', ') || '-';

  const browser = parseBrowser(user_agent);
  const os = parseOS(user_agent);
  const deviceInfo = os ? `${browser} / ${os}` : browser;

  return (
    <TableRow hover>
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

      <TableCell>{deviceInfo}</TableCell>

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
        {last_detected_at ? fDateTime(last_detected_at) : '-'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {created_at ? fDateTime(created_at) : '-'}
      </TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        {is_blocked ? (
          <Tooltip title="Unblock IP" placement="top" arrow>
            <IconButton color="success" onClick={() => onUnblockIp(blocked_ip_id!, ip_address)}>
              <Iconify icon="solar:shield-check-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Block IP" placement="top" arrow>
            <IconButton color="error" onClick={() => onBlockIp(ip_address)}>
              <Iconify icon="solar:shield-cross-bold" />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}
