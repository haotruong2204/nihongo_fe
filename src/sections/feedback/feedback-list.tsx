import { useRef, useEffect, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
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
  //
  hasMore?: boolean;
  onLoadMore?: VoidFunction;
  loadingMore?: boolean;
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
  //
  hasMore,
  onLoadMore,
  loadingMore,
}: Props) {
  const mdUp = useResponsive('up', 'md');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const handleScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 100 && hasMore && !loadingMore && onLoadMore) {
        onLoadMore();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, onLoadMore]);

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

      {loadingMore && (
        <Stack alignItems="center" sx={{ py: 2 }}>
          <CircularProgress size={24} />
        </Stack>
      )}
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

      <Scrollbar ref={scrollRef} sx={{ px: 2 }}>
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
