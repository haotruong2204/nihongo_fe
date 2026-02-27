import { useEffect, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
// api
import { useGetFeedbacks, useGetFeedback, useAdminFeedbackChannel } from 'src/api/feedback';
// components
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
//
import FeedbackList from '../feedback-list';
import FeedbackHeader from '../feedback-header';
import FeedbackDetails from '../feedback-details';

// ----------------------------------------------------------------------

export default function FeedbackView() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const selectedFeedbackId = searchParams.get('id') || '';

  const mdUp = useResponsive('up', 'md');

  const settings = useSettingsContext();

  const openList = useBoolean();

  const {
    feedbacks,
    feedbacksLoading,
    feedbacksError,
    feedbacksEmpty,
    feedbacksMutate,
    feedbacksHasMore,
    feedbacksLoadMore,
    feedbacksLoadingMore,
  } = useGetFeedbacks();

  const {
    feedback: selectedFeedback,
    feedbackMutate: selectedFeedbackMutate,
  } = useGetFeedback(selectedFeedbackId);

  const firstFeedbackId = feedbacks[0]?.id || '';

  const handleClickFeedback = useCallback(
    (feedbackId: string) => {
      if (!mdUp) {
        openList.onFalse();
      }

      const href = `${paths.dashboard.feedback}?id=${feedbackId}`;
      router.push(href);
    },
    [openList, router, mdUp]
  );

  useEffect(() => {
    if (feedbacksError) {
      router.push(paths.dashboard.feedback);
    }
  }, [feedbacksError, router]);

  useEffect(() => {
    if (!selectedFeedbackId && firstFeedbackId) {
      handleClickFeedback(firstFeedbackId);
    }
  }, [firstFeedbackId, handleClickFeedback, selectedFeedbackId]);

  const handleMutate = useCallback(() => {
    feedbacksMutate();
    selectedFeedbackMutate();
  }, [feedbacksMutate, selectedFeedbackMutate]);

  useAdminFeedbackChannel(handleMutate);

  const renderEmpty = (
    <EmptyContent
      title="No feedback yet"
      description="Feedback from users will appear here"
      imgUrl="/assets/icons/empty/ic_folder_empty.svg"
      sx={{
        borderRadius: 1.5,
        maxWidth: { md: 320 },
        bgcolor: 'background.default',
      }}
    />
  );

  const renderList = (
    <FeedbackList
      feedbacks={feedbacks}
      loading={feedbacksLoading}
      //
      openList={openList.value}
      onCloseList={openList.onFalse}
      onClickFeedback={handleClickFeedback}
      //
      selectedFeedbackId={selectedFeedbackId}
      //
      hasMore={feedbacksHasMore}
      onLoadMore={feedbacksLoadMore}
      loadingMore={feedbacksLoadingMore}
    />
  );

  const renderDetails = (
    <>
      {feedbacksEmpty ? (
        <EmptyContent
          imgUrl="/assets/icons/empty/ic_email_disabled.svg"
          sx={{
            borderRadius: 1.5,
            bgcolor: 'background.default',
            ...(!mdUp && {
              display: 'none',
            }),
          }}
        />
      ) : (
        <FeedbackDetails
          feedback={selectedFeedback}
          onMutate={handleMutate}
          onDelete={() => {
            handleMutate();
            router.push(paths.dashboard.feedback);
          }}
        />
      )}
    </>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Feedback
      </Typography>

      <Stack
        spacing={1}
        sx={{
          p: 1,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.neutral',
        }}
      >
        {!mdUp && (
          <FeedbackHeader onOpenList={feedbacksEmpty ? openList.onFalse : openList.onTrue} />
        )}

        <Stack
          spacing={1}
          direction="row"
          flexGrow={1}
          sx={{
            height: {
              xs: '72vh',
            },
          }}
        >
          {feedbacksEmpty ? renderEmpty : renderList}

          {renderDetails}
        </Stack>
      </Stack>
    </Container>
  );
}
