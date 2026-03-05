import { Helmet } from 'react-helmet-async';
// sections
import DevtoolsLogListView from 'src/sections/devtools-log/view/devtools-log-list-view';

// ----------------------------------------------------------------------

export default function DevtoolsLogPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: DevTools Logs</title>
      </Helmet>

      <DevtoolsLogListView />
    </>
  );
}
