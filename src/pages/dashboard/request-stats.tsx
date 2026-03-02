import { Helmet } from 'react-helmet-async';
// sections
import RequestStatsView from 'src/sections/request-stats/view/request-stats-view';

// ----------------------------------------------------------------------

export default function RequestStatsPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Request Stats</title>
      </Helmet>

      <RequestStatsView />
    </>
  );
}
