import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auctionAPI } from "../api/auction";
import { toast } from "react-hot-toast";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []); // Only fetch once when component mounts

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auctionAPI.getAllProducts();

      // Log the response for debugging
      console.log("API Response:", response);

      // Ensure response is an array
      if (!Array.isArray(response)) {
        console.error("Invalid response format:", response);
        setError("Invalid response format from server");
        return;
      }

      // Ensure each product has required fields
      const validProducts = response.filter(product => {
        const isValid = product && 
          typeof product.id !== 'undefined' && 
          (typeof product.name !== 'undefined' || typeof product.title !== 'undefined');
        
        if (!isValid) {
          console.warn("Invalid product data:", product);
        }
        return isValid;
      }).map(product => ({
        ...product,
        title: product.name || product.title,
        category_new_used: product.condition || product.category_new_used,
        starting_price: product.price || product.starting_price || 0,
        description: product.description || '',
        images: product.images || [],
        is_listed: product.is_listed ?? true,
        highest_bid_amount: product.highest_bid || product.highest_bid_amount || 0
      }));

      console.log("Processed Products:", validProducts);
      setProducts(validProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search query, category, and price range
  const filteredProducts = products.filter((product) => {
    if (!product) return false;

    // Search filter
    const title = product.title?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || description.includes(query);

    // Category filter
    const matchesCategory = selectedCategory === "all" || 
      product.category_new_used?.toLowerCase() === selectedCategory.toLowerCase();

    // Price range filter
    let matchesPrice = true;
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      const price = product.starting_price || 0;
      matchesPrice = price >= min && price <= max;
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="0-100">Under Rs.100</option>
              <option value="100-500">Rs.100 - Rs.500</option>
              <option value="500-1000">Rs.500 - Rs.1000</option>
              <option value="1000-5000">Rs.1000 - Rs.5000</option>
              <option value="5000-10000">Rs.5000 - Rs.10000</option>
              <option value="10000-999999">Over Rs.10000</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={product.images?.[0]?.image_data || "https://via.placeholder.com/400x300?text=No+Image"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${
                    product.is_listed
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.is_listed ? "Active" : "Sold"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">
                    Rs.{product.starting_price?.toLocaleString() || '0'}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {product.category_new_used}
                  </span>
                </div>
                {product.highest_bid_amount && (
                  <div className="mt-2 text-sm text-gray-600">
                    Highest Bid: Rs.{product.highest_bid_amount?.toLocaleString() || '0'}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
