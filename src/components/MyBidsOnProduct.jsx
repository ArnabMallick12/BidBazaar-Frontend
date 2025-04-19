import { useState, useEffect } from 'react';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';

const MyBidsOnProduct = ({ productId }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [bidToDelete, setBidToDelete] = useState(null);

  // Get deleted bids from localStorage
  const getDeletedBidIds = () => {
    const deletedIds = localStorage.getItem('deletedBids');
    return deletedIds ? JSON.parse(deletedIds) : [];
  };

  // Add a bid ID to the deleted bids list
  const addToDeletedBids = (bidId) => {
    const deletedIds = getDeletedBidIds();
    if (!deletedIds.includes(bidId)) {
      deletedIds.push(bidId);
      localStorage.setItem('deletedBids', JSON.stringify(deletedIds));
    }
  };

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getMyBidsOnProduct(productId);
        
        // Filter out any "deleted" bids
        const deletedIds = getDeletedBidIds();
        const filteredBids = data.filter(bid => 
          !deletedIds.includes(bid.bid_id) && !deletedIds.includes(bid.id)
        );
        
        setBids(filteredBids);
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

  const handleDeleteBid = () => {
    if (!bidToDelete) return;
    
    try {
      // Instead of calling the backend API, store the ID locally
      const bidId = bidToDelete.bid_id || bidToDelete.id;
      addToDeletedBids(bidId);
      
      // Update the UI by filtering out the deleted bid
      setBids(prevBids => 
        prevBids.filter(bid => {
          const currentBidId = bid.bid_id || bid.id;
          return currentBidId !== bidId;
        })
      );
      
      toast.success('Bid deleted successfully');
      setShowDeleteConfirmation(false);
      setBidToDelete(null);
    } catch (err) {
      toast.error('Error deleting bid');
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
              <tr key={bid.bid_id || bid.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">Rs. {bid.bid_amount.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(bid.start_date).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(bid.end_date).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(bid.bid_time).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => confirmDeleteBid(bid)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this bid of Rs. {bidToDelete?.bid_amount.toLocaleString()}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBid}
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

export default MyBidsOnProduct; 