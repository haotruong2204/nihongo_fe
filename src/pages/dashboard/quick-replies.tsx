import { Helmet } from 'react-helmet-async';
// sections
import QuickReplyView from 'src/sections/quick-reply/quick-reply-view';

// ----------------------------------------------------------------------

export default function QuickRepliesPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Quick Replies</title>
      </Helmet>

      <QuickReplyView />
    </>
  );
}
