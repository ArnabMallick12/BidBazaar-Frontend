import { useState, useEffect } from 'react';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';

const MyBidsOnProduct = ({ productId }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [bidToDelete, setBidToDelete] = useState(null);

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getMyBidsOnProduct(productId);
        setBids(data);
      } catch (err) {
        const error = auctionAPI.handleError(err);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, [productId]);

  const confirmDeleteBid = (bid) => {
    setBidToDelete(bid);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteBid = async () => {
    if (!bidToDelete) return;
    
    try {
      await auctionAPI.deleteBid(bidToDelete.bid_id);
      toast.success('Bid deleted successfully');
      // Refresh bids
      const data = await auctionAPI.getMyBidsOnProduct(productId);
      setBids(data);
      // Close confirmation dialog
      setShowDeleteConfirmation(false);
      setBidToDelete(null);
    } catch (err) {
      const error = auctionAPI.handleError(err);
      // Show specific error messages based on status code
      if (error.status === 404) {
        toast.error('Bid not found. It may have been already deleted.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to delete this bid.');
      } else if (error.status === 400) {
        toast.error('Cannot delete bid as the product has been sold with this bid.');
      } else {
        toast.error(error.message || 'Failed to delete bid');
      }
      setShowDeleteConfirmation(false);
      setBidToDelete(null);
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

  if (bids.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        You haven't placed any bids on this product
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">My Bids</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bid Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bid Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bids.map((bid) => (
              <tr key={bid.bid_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rs. {bid.bid_amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(bid.start_date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(bid.end_date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(bid.bid_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => confirmDeleteBid(bid)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete bid"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  setBidToDelete(null);
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
                Are you sure you want to delete this bid of Rs. {bidToDelete?.bid_amount?.toLocaleString()}? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setBidToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBid}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBidsOnProduct; 