import { Navigate } from 'react-router-dom';
import { authAPI } from '../api/auth';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = authAPI.isAuthenticated();
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the children components
  return children;
};

export default ProtectedRoute; 