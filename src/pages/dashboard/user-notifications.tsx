import { Helmet } from 'react-helmet-async';
// sections
import UserNotificationView from 'src/sections/notification/user-notification-view';

// ----------------------------------------------------------------------

export default function UserNotificationsPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Thông báo User</title>
      </Helmet>

      <UserNotificationView />
    </>
  );
}
