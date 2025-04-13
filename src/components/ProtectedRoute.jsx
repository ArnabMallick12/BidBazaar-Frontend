import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api/auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authAPI.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 