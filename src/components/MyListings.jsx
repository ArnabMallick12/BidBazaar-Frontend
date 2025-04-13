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

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getMyListings();
        setListings(data);
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

  const confirmDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await auctionAPI.deleteProduct(productToDelete.id);
      toast.success('Product listing deleted successfully');
      // Refresh listings
      const data = await auctionAPI.getMyListings();
      setListings(data);
      // Close confirmation dialog
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    } catch (err) {
      const error = auctionAPI.handleError(err);
      // Show specific error messages based on status code
      if (error.status === 404) {
        toast.error('Product not found. It may have been already deleted.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to delete this product.');
      } else {
        toast.error(error.message || 'Failed to delete product');
      }
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
      <div className="text-gray-500 text-center py-4">
        You haven't listed any products yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative aspect-w-16 aspect-h-9">
              <img
                src={listing.images?.[0]?.image || '/placeholder.png'}
                alt={listing.title}
                className="object-cover"
              />
              <button
                onClick={() => confirmDeleteProduct(listing)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                title="Delete product"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {listing.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {listing.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Starting Price</p>
                  <p className="text-lg font-semibold text-blue-600">
                    Rs. {listing.starting_price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${
                    listing.sold ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {listing.sold ? 'Sold' : 'Active'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  to={`/product/${listing.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details →
                </Link>
                {!listing.sold && listing.highest_bid_id && (
                  <button
                    onClick={() => handleSellProduct(listing.id, listing.highest_bid_id)}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Sell to Highest Bidder
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setProductToDelete(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete the product "{productToDelete?.title}"? This action cannot be undone.
              </p>
              {productToDelete?.highest_bid_id && (
                <p className="mt-2 text-yellow-600 font-medium">
                  Warning: This product has active bids which will also be deleted.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings; 