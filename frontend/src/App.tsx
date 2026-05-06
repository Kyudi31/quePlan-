<<<<<<< HEAD
import Login from './pages/Login';

function App() {
  return <Login />;
}

export default App;
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlansPage      from './modules/plans/pages/PlansPage';
import CreatePlanPage from './modules/plans/pages/CreatePlanPage';
import PlanDetailPage from './modules/plans/pages/PlanDetailPage';
import EditPlanPage   from './modules/plans/pages/EditPlanPage';
import AdminPage      from './modules/admin/pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Usuario */}
        <Route path="/"               element={<Navigate to="/plans" replace />} />
        <Route path="/plans"          element={<PlansPage />} />
        <Route path="/plans/new"      element={<CreatePlanPage />} />
        <Route path="/plans/:id"      element={<PlanDetailPage />} />
        <Route path="/plans/:id/edit" element={<EditPlanPage />} />
        {/* Administrador */}
        <Route path="/admin"          element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

/*

cambios en el archivo tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlansPage from './modules/plans/pages/PlansPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/plans" replace />} />
        <Route path="/plans" element={<PlansPage />} />
      </Routes>
    </BrowserRouter>
  );
}

*/
>>>>>>> origin/feature/plan-management
