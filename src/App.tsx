import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddShop } from './pages/AddShop';
import { ShopRecords } from './pages/ShopRecords';
import { Settings } from './pages/Settings';
import { AppLock } from './components/AppLock';

/**
 * Ensures that whenever the app is opened freshly in mobile or desktop,
 * it immediately opens the Dashboard (/) instead of opening Shop Records
 * or restoring a previous sub-route.
 */
function InitialLaunchHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isSessionActive = sessionStorage.getItem('shop_app_session_active');
    if (!isSessionActive) {
      sessionStorage.setItem('shop_app_session_active', 'true');
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <AppLock>
      <Router>
        <InitialLaunchHandler />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-shop" element={<AddShop />} />
            <Route path="records" element={<ShopRecords />} />
            <Route path="settings" element={<Settings />} />
            {/* Fallback catch-all: always navigate to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppLock>
  );
}

export default App;
