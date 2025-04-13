import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../api/auction';
import { authAPI } from '../api/auth';
import { toast } from 'react-hot-toast';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        // First get all products
        const products = await auctionAPI.getAllProducts();
        
        // Process each product to find user's bids and check highest bid status
        const bidsPromises = products.map(async (product) => {
          try {
            // Get all bids for this product
            const allProductBids = await auctionAPI.getBids(product.id);
            
            // Filter bids that belong to current user
            const currentUserId = authAPI.getCurrentUser().id;
            const myBidsOnProduct = allProductBids.filter(bid => 
              bid.user_id === currentUserId
            );
            
            if (myBidsOnProduct.length === 0) {
              return [];
            }
            
            // Get the highest bid for this product
            let highestBid;
            try {
              highestBid = await auctionAPI.getHighestBid(product.id);
            } catch (highestBidError) {
              console.log(`No highest bid for product ${product.id}`);
              highestBid = null;
            }
            
            // Add product details to each of the user's bids on this product
            return myBidsOnProduct.map(bid => ({
              ...bid,
              product_id: product.id,
              product_title: product.title,
              product_description: product.description,
              product_images: product.images,
              // Check if this bid is the highest bid
              is_highest_bid: highestBid && highestBid.id === bid.id
            }));
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
            key={`${bid.product_id}-${bid.id}`}
            to={`/product/${bid.product_id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={bid.product_images?.[0] || '/placeholder.png'}
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
                  <p className={`text-sm font-medium ${
                    bid.is_highest_bid ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {bid.is_highest_bid ? 'Highest Bid' : 'Outbid'}
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