// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
// types
import { IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IUserTableFilters;
  onFilters: (name: string, value: IUserTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
};

export default function UserTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}: Props) {
  const handleRemovePremium = () => {
    onFilters('isPremium', 'all');
  };

  const handleRemoveSearch = () => {
    onFilters('search', '');
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.search && (
          <Block label="Search:">
            <Chip size="small" label={filters.search} onDelete={handleRemoveSearch} />
          </Block>
        )}

        {filters.isPremium !== 'all' && (
          <Block label="Status:">
            <Chip
              size="small"
              label={filters.isPremium === 'true' ? 'Premium' : 'Free'}
              onDelete={handleRemovePremium}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
