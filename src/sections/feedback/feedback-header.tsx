// @mui
import IconButton from '@mui/material/IconButton';
import Stack, { StackProps } from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = StackProps & {
  onOpenList: VoidFunction;
};

export default function FeedbackHeader({ onOpenList, ...other }: Props) {
  return (
    <Stack spacing={2} direction="row" alignItems="center" sx={{ py: 1 }} {...other}>
      <IconButton onClick={onOpenList}>
        <Iconify icon="solar:chat-round-dots-bold" />
      </IconButton>
    </Stack>
  );
}
