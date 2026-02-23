// @mui
import Skeleton from '@mui/material/Skeleton';
import Stack, { StackProps } from '@mui/material/Stack';

// ----------------------------------------------------------------------

export function FeedbackItemSkeleton({ sx, ...other }: StackProps) {
  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      sx={{
        py: 1,
        ...sx,
      }}
      {...other}
    >
      <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />

      <Stack spacing={1} flexGrow={1}>
        <Skeleton sx={{ width: 0.75, height: 10 }} />
        <Skeleton sx={{ width: 0.5, height: 10 }} />
      </Stack>
    </Stack>
  );
}
