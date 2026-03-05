// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
// types
import { IDevtoolsLogItem } from 'src/types/devtools-log';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Label from 'src/components/label';

// ----------------------------------------------------------------------

type Props = {
  row: IDevtoolsLogItem;
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

export default function DevtoolsLogTableRow({ row }: Props) {
  const { ip_address, email, user_agent, open_count, last_detected_at, created_at } = row;

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

      <TableCell>
        <Label
          variant="soft"
          color={getCountColor(open_count)}
        >
          {open_count}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {last_detected_at ? fDateTime(last_detected_at) : '-'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {created_at ? fDateTime(created_at) : '-'}
      </TableCell>
    </TableRow>
  );
}
