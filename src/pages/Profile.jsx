import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auctionAPI } from "../api/auction";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const listings = await auctionAPI.getMyListings();
        setMyListings(listings);
        // Note: You might want to add a user API endpoint to get user details
        // For now, we'll use the stored user data
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const confirmDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await auctionAPI.deleteUserAccount();
      // Show more detailed success message if available
      if (response && response.details) {
        toast.success(`Account deleted successfully. ${response.details}`);
      } else {
        toast.success('Your account has been deleted successfully');
      }
      navigate('/login');
    } catch (err) {
      const error = auctionAPI.handleError(err);
      // Handle database error specifically
      if (error.status === 500) {
        toast.error(`Database error occurred: ${error.data?.details || 'Unknown error'}`);
      } else {
        toast.error(error.message || 'Failed to delete account');
      }
      setShowDeleteConfirmation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Profile Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
            >
              Logout
            </button>
           
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Listings</h2>
        {myListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {product.images[0].image_url && product.images.length > 0 && (
                  <img
                    src={product.images[0].image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Starting Price</p>
                      <p className="text-lg font-semibold text-blue-600">
                        Rs. {product.starting_price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Status</p>
                      <p
                        className={`text-sm font-medium ${
                          product.sold ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {product.sold ? "Sold" : "Active"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't listed any products yet.</p>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <p className="text-red-600 font-medium">
                All your products, bids, and personal information will be permanently deleted.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
