import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import MyListings from '../components/MyListings';

const MyListingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
        <p className="mt-2 text-gray-600">
          Manage your product listings and view their status
        </p>
      </div>
      <MyListings />
    </div>
  );
};

export default MyListingsPage; 