import { Helmet } from 'react-helmet-async';
// sections
import NotificationsView from 'src/sections/notification/notification-view';

// ----------------------------------------------------------------------

export default function NotificationsPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Thông báo</title>
      </Helmet>

      <NotificationsView />
    </>
  );
}
