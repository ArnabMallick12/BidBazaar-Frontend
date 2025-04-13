import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auctionAPI } from "../api/auction";
import { toast } from "react-hot-toast";

const AddProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starting_price: "",
    category_new_used: "new",
    start_date: "",
    end_date: "",
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dates
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const now = new Date();

      if (start < now) {
        throw new Error("Start date cannot be in the past");
      }

      if (end <= start) {
        throw new Error("End date must be after start date");
      }

      // First create the product
      const product = await auctionAPI.createProduct(formData);

      // Then upload images if any
      if (images.length > 0) {
        await auctionAPI.uploadProductImages(product.id, images);
      }

      toast.success("Product added successfully!");
      navigate("/my-listings");
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter product title"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter product description"
          />
        </div>

        {/* Starting Price */}
        <div>
          <label htmlFor="starting_price" className="block text-sm font-medium text-gray-700">
            Starting Price (Rs.)
          </label>
          <input
            type="number"
            id="starting_price"
            name="starting_price"
            value={formData.starting_price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter starting price"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category_new_used" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category_new_used"
            name="category_new_used"
            value={formData.category_new_used}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        {/* Auction Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              min={formData.start_date || new Date().toISOString().slice(0, 16)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Product Images
          </label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            required
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            You can select multiple images
          </p>
        </div>

        {/* Preview Images */}
        {images.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/my-listings")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm; 