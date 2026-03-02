import { useCallback, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
// types
import { IRequestStatFilters, IRequestStatFilterValue } from 'src/types/request-stats';

// ----------------------------------------------------------------------

type Props = {
  filters: IRequestStatFilters;
  onFilters: (name: string, value: IRequestStatFilterValue) => void;
  onResetFilters: VoidFunction;
  canReset: boolean;
  onViewRealtime: (userId: string) => void;
};

export default function RequestStatsToolbar({
  filters,
  onFilters,
  onResetFilters,
  canReset,
  onViewRealtime,
}: Props) {
  const [realtimeInput, setRealtimeInput] = useState('');

  const handleFilterSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('search', event.target.value);
    },
    [onFilters]
  );

  const handleFilterFlagged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('flagged', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5 }}
    >
      <TextField
        size="small"
        value={filters.search}
        onChange={handleFilterSearch}
        placeholder="Search by User ID..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ width: { xs: 1, md: 200 } }}
      />

      <TextField
        size="small"
        select
        label="Flagged"
        value={filters.flagged}
        onChange={handleFilterFlagged}
        sx={{ width: { xs: 1, md: 140 } }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="true">Flagged</MenuItem>
        <MenuItem value="false">OK</MenuItem>
      </TextField>

      {canReset && (
        <Button
          color="error"
          size="small"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      )}

      <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
        <TextField
          size="small"
          value={realtimeInput}
          onChange={(e) => setRealtimeInput(e.target.value)}
          placeholder="User ID"
          sx={{ width: 120 }}
        />
        <Button
          size="small"
          variant="contained"
          disabled={!realtimeInput}
          onClick={() => {
            onViewRealtime(realtimeInput);
            setRealtimeInput('');
          }}
          startIcon={<Iconify icon="solar:monitor-smartphone-bold-duotone" />}
        >
          Realtime
        </Button>
      </Stack>
    </Stack>
  );
}
