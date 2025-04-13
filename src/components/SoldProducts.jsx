import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';

const SoldProducts = ({ sellerId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getSoldProductsBySeller(sellerId);
        setProducts(data);
      } catch (err) {
        const error = auctionAPI.handleError(err);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldProducts();
  }, [sellerId]);

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

  if (products.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No sold products
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Sold Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={product.images?.[0]?.image_data || '/placeholder.png'}
                alt={product.title}
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {product.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Sold Price</p>
                  <p className="text-lg font-semibold text-green-600">
                    Rs. {product.sold_price?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Sold Date</p>
                  <p className="text-sm font-medium text-gray-600">
                    {new Date(product.sold_date).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/product/${product.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoldProducts; 