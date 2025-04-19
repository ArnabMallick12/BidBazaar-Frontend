import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../api/auction';
import { authAPI } from '../api/auth';
import { toast } from 'react-hot-toast';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDeletedBidIds = () => {
    const deletedIds = localStorage.getItem('deletedBids');
    return deletedIds ? JSON.parse(deletedIds) : [];
  };

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        // First get all products
        const products = await auctionAPI.getAllProducts();
        
        // Get deleted bid IDs
        const deletedBidIds = getDeletedBidIds();
        
        // Process each product to find user's bids and check bid status
        const bidsPromises = products.map(async (product) => {
          try {
            // Get all bids for this product
            const productBids = await auctionAPI.getMyBidsOnProduct(product.id);
            
            // Filter out deleted bids
            const filteredBids = productBids.filter(bid => {
              const bidId = bid.bid_id || bid.id;
              return !deletedBidIds.includes(bidId);
            });
            
            if (filteredBids && filteredBids.length > 0) {
              // Add product details to each bid
              return filteredBids.map(bid => {
                // Determine bid status
                let bidStatus = 'Outbid';
                let statusClass = 'text-yellow-600';
                
                // Check if product is sold and this bid was accepted
                if (product.sold && (product.highest_bid_id === bid.bid_id || product.highest_bid_id === bid.id)) {
                  bidStatus = 'Accepted';
                  statusClass = 'text-green-600 font-bold';
                }
                // If product is not sold but this is the highest bid
                else if (!product.sold && (product.highest_bid_id === bid.bid_id || product.highest_bid_id === bid.id)) {
                  bidStatus = 'Highest Bid';
                  statusClass = 'text-green-600';
                }
                
                return {
                  ...bid,
                  product_id: product.id,
                  product_title: product.title,
                  product_description: product.description,
                  product_images: product.images,
                  bid_status: bidStatus,
                  status_class: statusClass,
                  is_accepted: product.sold && (product.highest_bid_id === bid.bid_id || product.highest_bid_id === bid.id),
                  is_highest_bid: !product.sold && (product.highest_bid_id === bid.bid_id || product.highest_bid_id === bid.id)
                };
              });
            }
            return [];
          } catch (err) {
            console.error(`Error fetching bids for product ${product.id}:`, err);
            return [];
          }
        });

        // Wait for all bid requests to complete
        const allBids = await Promise.all(bidsPromises);
        // Flatten the array of arrays into a single array of bids
        const flattenedBids = allBids.flat();
        setBids(flattenedBids);
      } catch (err) {
        const error = auctionAPI.handleError(err);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

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
        You haven't placed any bids yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">My Bids</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bids.map((bid) => (
          <Link
            key={`${bid.product_id}-${bid.bid_id || bid.id}`}
            to={`/product/${bid.product_id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={
                    bid.product_images && 
                    bid.product_images.length > 0 && 
                    bid.product_images[0].image_url ? 
                      bid.product_images[0].image_url : 
                      "/placeholder.png"
                  }
                  alt={bid.product_title}
                  className="object-cover rounded-md"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {bid.product_title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {bid.product_description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Your Bid</p>
                  <p className="text-lg font-semibold text-blue-600">
                    Rs. {bid.bid_amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${bid.status_class}`}>
                    {bid.bid_status}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyBids; 