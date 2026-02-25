import { formatDistanceToNowStrict } from 'date-fns';
// @mui
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton';
// types
import { IFeedbackItem } from 'src/types/feedback';

// ----------------------------------------------------------------------

type Props = ListItemButtonProps & {
  feedback: IFeedbackItem;
  selected: boolean;
  onClickFeedback: VoidFunction;
};

export default function FeedbackItem({
  feedback,
  selected,
  onClickFeedback,
  sx,
  ...other
}: Props) {
  const name = feedback.user?.display_name || feedback.email || 'Unknown';

  return (
    <ListItemButton
      onClick={onClickFeedback}
      sx={{
        p: 1,
        mb: 0.5,
        borderRadius: 1,
        ...(selected && {
          bgcolor: 'action.selected',
        }),
        ...sx,
      }}
      {...other}
    >
      <Avatar
        alt={name}
        src={feedback.user?.photo_url || ''}
        sx={{ mr: 2 }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>

      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
            {feedback.context_type && (
              <Chip
                label={feedback.context_type === 'vocab_lesson' ? 'Vocab' : feedback.context_type}
                size="small"
                color="info"
                variant="soft"
                sx={{ height: 20, fontSize: 11 }}
              />
            )}
          </Stack>
        }
        secondary={feedback.text}
        secondaryTypographyProps={{
          noWrap: true,
          component: 'span',
          variant: 'body2',
          color: 'text.secondary',
        }}
      />

      <Stack alignItems="flex-end" sx={{ ml: 2, height: 44 }}>
        <Typography
          noWrap
          variant="body2"
          component="span"
          sx={{
            mb: 1.5,
            fontSize: 12,
            color: 'text.disabled',
          }}
        >
          {formatDistanceToNowStrict(new Date(feedback.created_at), {
            addSuffix: false,
          })}
        </Typography>
      </Stack>
    </ListItemButton>
  );
}
