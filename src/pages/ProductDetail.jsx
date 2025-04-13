import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auctionAPI } from "../api/auction";
import { toast } from "react-hot-toast";
import BidForm from "../components/BidForm";
import { authAPI } from "../api/auth";
import BidHistory from '../components/BidHistory';
import MyBidsOnProduct from '../components/MyBidsOnProduct';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBidForm, setShowBidForm] = useState(false);
  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const [productData, bidsData] = await Promise.all([
          auctionAPI.getProductDetails(id),
          auctionAPI.getBids(id)
        ]);
        setProduct(productData);
        setBids(bidsData);
      } catch (err) {
        const error = auctionAPI.handleError(err);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handlePlaceBid = async (amount, startDate, endDate) => {
    try {
      await auctionAPI.placeBid(id, amount, startDate, endDate);
      toast.success('Bid placed successfully!');
      // Refresh product details and bids
      const [productData, bidsData] = await Promise.all([
        auctionAPI.getProductDetails(id),
        auctionAPI.getBids(id)
      ]);
      setProduct(productData);
      setBids(bidsData);
      setShowBidForm(false);
    } catch (err) {
      const error = auctionAPI.handleError(err);
      toast.error(error.message);
    }
  };

  const handleSellProduct = async (bidId) => {
    try {
      await auctionAPI.sellProduct(id, bidId);
      toast.success('Product sold successfully!');
      // Refresh product details and bids
      const [productData, bidsData] = await Promise.all([
        auctionAPI.getProductDetails(id),
        auctionAPI.getBids(id)
      ]);
      setProduct(productData);
      setBids(bidsData);
      setShowSellConfirmation(false);
      setSelectedBid(null);
    } catch (err) {
      const error = auctionAPI.handleError(err);
      toast.error(error.message);
    }
  };

  const openSellConfirmation = (bid) => {
    setSelectedBid(bid);
    setShowSellConfirmation(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-gray-500 text-center py-8">
        Product not found
      </div>
    );
  }

  const isAuthenticated = authAPI.isAuthenticated();
  const currentUser = authAPI.getCurrentUser();
  const isOwner = isAuthenticated && currentUser && product.user_id === currentUser.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={product.images?.[0]?.image_data || '/placeholder.png'}
              alt={product.title}
              className="object-cover rounded-lg"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((image) => (
                <img
                  key={image.id}
                  src={image.image_data}
                  alt={`${product.title} ${image.id}`}
                  className="object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Starting Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rs. {product.starting_price.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-sm font-medium ${
                  product.sold ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {product.sold ? 'Sold' : 'Active'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {product.category_new_used}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(product.end_date).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {product.highest_bid_amount && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Highest Bid</p>
                  <p className="text-xl font-bold text-green-600">
                    Rs. {product.highest_bid_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!product.sold && isAuthenticated && !isOwner && (
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => setShowBidForm(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Place Bid
              </button>
            </div>
          )}

          {isOwner && !product.sold && bids.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bids</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {bids.map((bid) => (
                    <li key={bid.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600 truncate">
                            Rs. {bid.bid_amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            By {bid.username} on {new Date(bid.bid_time).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => openSellConfirmation(bid)}
                          className="ml-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Sell to this Bidder
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bid Form Modal */}
      {showBidForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Place Bid</h2>
              <button
                onClick={() => setShowBidForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BidForm
              productId={id}
              startingPrice={product.starting_price}
              highestBid={product.highest_bid_amount}
              onBidPlaced={() => {
                setShowBidForm(false);
                // Refresh product details and bids
                const fetchData = async () => {
                  const [productData, bidsData] = await Promise.all([
                    auctionAPI.getProductDetails(id),
                    auctionAPI.getBids(id)
                  ]);
                  setProduct(productData);
                  setBids(bidsData);
                };
                fetchData();
              }}
            />
          </div>
        </div>
      )}

      {/* Sell Confirmation Modal */}
      {showSellConfirmation && selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Confirm Sale</h2>
              <button
                onClick={() => {
                  setShowSellConfirmation(false);
                  setSelectedBid(null);
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
                Are you sure you want to sell this product to {selectedBid.username} for Rs. {selectedBid.bid_amount.toLocaleString()}?
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSellConfirmation(false);
                  setSelectedBid(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSellProduct(selectedBid.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid History and My Bids */}
      <div className="mt-12 space-y-8">
        <BidHistory productId={id} />
        {isAuthenticated && <MyBidsOnProduct productId={id} />}
      </div>
    </div>
  );
};

export default ProductDetail;
