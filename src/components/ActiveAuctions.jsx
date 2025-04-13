import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';

const ActiveAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getActiveAuctionsByEndTime();
        setAuctions(data);
      } catch (err) {
        const error = auctionAPI.handleError(err);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
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

  if (auctions.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No active auctions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Active Auctions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <Link
            key={auction.id}
            to={`/product/${auction.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={auction.images?.[0] || '/placeholder.png'}
                  alt={auction.title}
                  className="object-cover rounded-md"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {auction.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {auction.description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Starting Price</p>
                  <p className="text-lg font-semibold text-blue-600">
                    Rs. {auction.starting_price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Ends</p>
                  <p className="text-sm font-medium text-red-600">
                    {new Date(auction.end_date).toLocaleString()}
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

export default ActiveAuctions; 