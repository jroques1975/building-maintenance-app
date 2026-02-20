import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Dashboard from '../pages/Dashboard';
import Issues from '../pages/Issues';
import Login from '../pages/Login';
import OperatorContinuity from '../pages/OperatorContinuity';
import UatChecklist from '../pages/UatChecklist';
import WorkOrders from '../pages/WorkOrders';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'login', element: <Login /> },
      { path: 'issues', element: <Issues /> },
      { path: 'work-orders', element: <WorkOrders /> },
      { path: 'operator-continuity', element: <OperatorContinuity /> },
      { path: 'uat-checklist', element: <UatChecklist /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
