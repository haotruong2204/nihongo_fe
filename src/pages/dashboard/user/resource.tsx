import { Helmet } from 'react-helmet-async';
// sections
import { UserResourceListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserResourceListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User Resources</title>
      </Helmet>

      <UserResourceListView />
    </>
  );
}
