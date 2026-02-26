import { useState, useEffect, useCallback, useRef } from 'react';
// @mui
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
// api
import { searchUsers } from 'src/api/user';
// types
import { IUserItem } from 'src/types/user';

// ----------------------------------------------------------------------

type Props = {
  value: IUserItem | null;
  onChange: (user: IUserItem | null) => void;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
};

export default function UserAutocomplete({
  value,
  onChange,
  label = 'Tìm user',
  placeholder = 'Nhập tên hoặc email...',
  fullWidth = true,
}: Props) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<IUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 1) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(query);
        setOptions(results);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  return (
    <Autocomplete
      fullWidth={fullWidth}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
        handleSearch(newInputValue);
      }}
      options={options}
      loading={loading}
      getOptionLabel={(option) => `${option.display_name} (${option.email})`}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      noOptionsText={inputValue ? 'Không tìm thấy user' : 'Nhập để tìm kiếm...'}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 1 }}>
            <Stack sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {option.display_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {option.email}
              </Typography>
            </Stack>
            <Chip label={`#${option.id}`} size="small" variant="outlined" />
            {option.is_premium && (
              <Chip label="Premium" size="small" color="warning" variant="soft" />
            )}
          </Stack>
        </li>
      )}
    />
  );
}
