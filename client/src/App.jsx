import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import SearchMedicine from './pages/patient/SearchMedicine';
import MedicineDetails from './pages/patient/MedicineDetails';
import PharmacyDetails from './pages/patient/PharmacyDetails';
import Profile from './pages/patient/Profile';

// Pharmacy pages
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyProfile from './pages/pharmacy/PharmacyProfile';
import Inventory from './pages/pharmacy/Inventory';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPharmacies from './pages/admin/AdminPharmacies';
import AdminMedicines from './pages/admin/AdminMedicines';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/search"
            element={
              <ProtectedRoute>
                <SearchMedicine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/medicine/:id"
            element={
              <ProtectedRoute>
                <MedicineDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/pharmacy/:id"
            element={
              <ProtectedRoute>
                <PharmacyDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['patient']}>
                  <Profile />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Pharmacy routes */}
          <Route
            path="/pharmacy/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['pharmacy']}>
                  <PharmacyDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['pharmacy']}>
                  <PharmacyProfile />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy/inventory"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['pharmacy']}>
                  <Inventory />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pharmacies"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminPharmacies />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminMedicines />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Fallback — redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
