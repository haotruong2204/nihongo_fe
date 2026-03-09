import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const BROWSER_ICON: Record<string, string> = {
  Chrome: 'logos:chrome',
  Firefox: 'logos:firefox',
  Safari: 'logos:safari',
  Edge: 'simple-icons:microsoftedge',
  Brave: 'simple-icons:brave',
  Opera: 'logos:opera',
  Samsung: 'simple-icons:samsung',
  Other: 'mdi:web',
};

const OS_ICON: Record<string, string> = {
  Windows: 'logos:microsoft-windows',
  macOS: 'ic:baseline-apple',
  iOS: 'ic:baseline-apple',
  iPadOS: 'ic:baseline-apple',
  Android: 'logos:android-icon',
  Linux: 'simple-icons:linux',
  Other: 'mdi:devices',
};

const DEVICE_ICON: Record<string, string> = {
  Mobile: 'solar:smartphone-bold',
  Tablet: 'solar:tablet-bold',
  Desktop: 'solar:monitor-bold',
};

const DEVICE_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  Mobile: 'warning',
  Tablet: 'info',
  Desktop: 'success',
};

// ----------------------------------------------------------------------

// Parse raw user agent string into "Browser / OS / DeviceType" format
export function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown';

  let browser = 'Other';
  if (/Brave/i.test(ua)) browser = 'Brave';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';

  let os = 'Other';
  if (/iPhone/i.test(ua)) os = 'iOS';
  else if (/iPad/i.test(ua)) os = 'iPadOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let deviceType = 'Desktop';
  if (/Mobile/i.test(ua) && !/iPad/i.test(ua)) deviceType = 'Mobile';
  else if (/iPad|Tablet/i.test(ua)) deviceType = 'Tablet';

  return `${browser} / ${os} / ${deviceType}`;
}

// ----------------------------------------------------------------------

type Props = {
  deviceInfo: string;
};

export default function DeviceInfoChip({ deviceInfo }: Props) {
  if (!deviceInfo || deviceInfo === 'Unknown' || deviceInfo === '-') {
    return (
      <Chip label="Unknown" size="small" variant="outlined" color="default" />
    );
  }

  const parts = deviceInfo.split(' / ').map((s) => s.trim());
  const [browser = 'Other', os = 'Other', deviceType = 'Desktop'] = parts;

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      <Tooltip title={browser} arrow>
        <Chip
          size="small"
          variant="soft"
          icon={<Iconify icon={BROWSER_ICON[browser] || BROWSER_ICON.Other} width={14} />}
          label={browser}
          sx={{ fontSize: 11 }}
        />
      </Tooltip>

      <Tooltip title={os} arrow>
        <Chip
          size="small"
          variant="soft"
          icon={<Iconify icon={OS_ICON[os] || OS_ICON.Other} width={14} />}
          label={os}
          sx={{ fontSize: 11 }}
        />
      </Tooltip>

      <Tooltip title={deviceType} arrow>
        <Chip
          size="small"
          variant="soft"
          color={DEVICE_COLOR[deviceType] || 'default'}
          icon={<Iconify icon={DEVICE_ICON[deviceType] || DEVICE_ICON.Desktop} width={14} />}
          label={deviceType}
          sx={{ fontSize: 11 }}
        />
      </Tooltip>
    </Stack>
  );
}
