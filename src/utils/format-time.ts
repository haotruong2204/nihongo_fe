import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

// Convert any date to UTC+7 (Vietnam timezone)
function toUTC7(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd-MM-yyyy';

  return date ? format(toUTC7(new Date(date)), fm) : '';
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'HH:mm dd-MM-yyyy';

  return date ? format(toUTC7(new Date(date)), fm) : '';
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}
