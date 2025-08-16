import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Protected } from './components/Protected';
import { LoadingScreen } from './components/LoadingScreen';
import { Login } from './pages/Login';
import { DashboardProducer } from './pages/DashboardProducer';
import { DashboardRetailer } from './pages/DashboardRetailer';
import { DashboardConsumer } from './pages/DashboardConsumer';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { PublicTrace } from './pages/PublicTrace';
import { NotFound } from './pages/NotFound';
import { useAuthStore } from './store/auth';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  console.log('App render:', { isAuthenticated, user: user?.role });

  // Show loading screen for 5 seconds on app start
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize auth from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedAuth = localStorage.getItem('auth-storage');
    
    console.log('Auth initialization:', { token: !!token, storedAuth });
    
    if (token && !isAuthenticated && storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        console.log('Restoring auth from storage:', authData);
        // The zustand persist middleware should handle this automatically
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
      }
    }
  }, [isAuthenticated]);

  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return '/login';
    
    switch (user.role) {
      case 'PRODUCER':
        return '/producer';
      case 'RETAILER':
        return '/retailer';
      case 'CONSUMER':
        return '/consumer';
      case 'ADMIN':
        return '/admin';
      default:
        return '/login';
    }
  };

  // Show loading screen for first 5 seconds
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Nav />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/trace/:batchId" element={<PublicTrace />} />
          
          {/* Debug Route */}
          <Route path="/debug" element={
            <div className="p-8">
              <h1>Debug Info</h1>
              <pre>{JSON.stringify({ isAuthenticated, user }, null, 2)}</pre>
            </div>
          } />
          
          {/* Protected Routes */}
          <Route
            path="/producer"
            element={
              <Protected roles={['PRODUCER']}>
                <DashboardProducer />
              </Protected>
            }
          />
          <Route
            path="/retailer"
            element={
              <Protected roles={['RETAILER']}>
                <DashboardRetailer />
              </Protected>
            }
          />
          <Route
            path="/consumer"
            element={
              <Protected roles={['CONSUMER']}>
                <DashboardConsumer />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected roles={['ADMIN']}>
                <DashboardAdmin />
              </Protected>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
