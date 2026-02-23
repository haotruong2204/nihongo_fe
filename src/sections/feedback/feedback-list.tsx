// @mui
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// types
import { IFeedbackItem } from 'src/types/feedback';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
//
import FeedbackItem from './feedback-item';
import { FeedbackItemSkeleton } from './feedback-skeleton';

// ----------------------------------------------------------------------

type Props = {
  loading: boolean;
  feedbacks: IFeedbackItem[];
  //
  openList: boolean;
  onCloseList: VoidFunction;
  onClickFeedback: (id: string) => void;
  //
  selectedFeedbackId: string;
};

export default function FeedbackList({
  loading,
  feedbacks,
  //
  openList,
  onCloseList,
  onClickFeedback,
  //
  selectedFeedbackId,
}: Props) {
  const mdUp = useResponsive('up', 'md');

  const renderSkeleton = (
    <>
      {[...Array(8)].map((_, index) => (
        <FeedbackItemSkeleton key={index} />
      ))}
    </>
  );

  const renderList = (
    <>
      {feedbacks.map((feedback) => (
        <FeedbackItem
          key={feedback.id}
          feedback={feedback}
          selected={selectedFeedbackId === feedback.id}
          onClickFeedback={() => {
            onClickFeedback(feedback.id);
          }}
        />
      ))}
    </>
  );

  const renderContent = (
    <>
      <Stack sx={{ p: 2 }}>
        <TextField
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Scrollbar sx={{ px: 2 }}>
        {loading && renderSkeleton}

        {!!feedbacks.length && renderList}
      </Scrollbar>
    </>
  );

  return mdUp ? (
    <Stack
      sx={{
        width: 320,
        flexShrink: 0,
        borderRadius: 1.5,
        bgcolor: 'background.default',
      }}
    >
      {renderContent}
    </Stack>
  ) : (
    <Drawer
      open={openList}
      onClose={onCloseList}
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: {
          width: 320,
        },
      }}
    >
      {renderContent}
    </Drawer>
  );
}
