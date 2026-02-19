import { Navigate, useRoutes } from 'react-router-dom';
// layouts
// config
// import { PATH_AFTER_LOGIN } from 'src/config-global';
//
import NotFoundPage from 'src/pages/404';
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },

    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },

    // route 404 global
    { path: '/404', element: <NotFoundPage /> },
  ]);
}
