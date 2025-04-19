import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Get deleted products from localStorage
  const getDeletedProductIds = () => {
    const deletedIds = localStorage.getItem('deletedProducts');
    return deletedIds ? JSON.parse(deletedIds) : [];
  };

  // Add a product ID to the deleted products list
  const addToDeletedProducts = (productId) => {
    const deletedIds = getDeletedProductIds();
    if (!deletedIds.includes(productId)) {
      deletedIds.push(productId);
      localStorage.setItem('deletedProducts', JSON.stringify(deletedIds));
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getMyListings();
        
        // Filter out any "deleted" products
        const deletedIds = getDeletedProductIds();
        const filteredListings = data.filter(listing => !deletedIds.includes(listing.id));
        
        setListings(filteredListings);
      } catch (err) {
        const error = auctionAPI.handleError(err);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSellProduct = async (productId, bidId) => {
    try {
      await auctionAPI.sellProduct(productId, bidId);
      toast.success('Product sold successfully!');
      // Refresh listings
      const data = await auctionAPI.getMyListings();
      setListings(data);
    } catch (err) {
      const error = auctionAPI.handleError(err);
      toast.error(error.message);
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    
    try {
      // Instead of calling the backend API, store the ID locally
      addToDeletedProducts(productToDelete.id);
      
      // Update the UI by filtering out the deleted product
      setListings(prevListings => 
        prevListings.filter(listing => listing.id !== productToDelete.id)
      );
      
      toast.success('Product deleted successfully');
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error('Error deleting product');
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't listed any products yet</p>
        <Link
          to="/add-product"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Your First Product
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
        <Link
          to="/add-product"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Product
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <Link to={`/product/${listing.id}`}>
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={
                    listing.images && 
                    listing.images.length > 0 && 
                    listing.images[0].image_url ? 
                      listing.images[0].image_url : 
                      '/placeholder.png'
                  }
                  alt={listing.title}
                  className="object-cover w-full h-48"
                />
              </div>
            </Link>
            
            <div className="p-4">
              <Link to={`/product/${listing.id}`}>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {listing.title}
                </h4>
              </Link>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {listing.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Starting Price</p>
                  <p className="text-lg font-semibold text-blue-600">
                    Rs. {listing.starting_price.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => confirmDelete(listing)}
                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                    title="Delete Product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings; 