import { Helmet } from 'react-helmet-async';
// sections
import { FeedbackView } from 'src/sections/feedback/view';

// ----------------------------------------------------------------------

export default function FeedbackPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Feedback</title>
      </Helmet>

      <FeedbackView />
    </>
  );
}
