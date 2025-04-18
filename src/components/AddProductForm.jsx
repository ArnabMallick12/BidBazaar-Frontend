import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authAPI } from "../api/auth";
import { API_URL } from '../config';

const AddProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starting_price: "",
    category_new_used: "new",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    const isFormFilled = 
      formData.title.trim() !== "" && 
      formData.description.trim() !== "" && 
      formData.starting_price.trim() !== "" && 
      formData.start_date.trim() !== "" && 
      formData.end_date.trim() !== "";
    
    const areImagesUploaded = imageUrls.length > 0;
    
    setFormComplete(isFormFilled && areImagesUploaded && !uploading);
  }, [formData, imageUrls, uploading]);

  // Handle image selection and upload to Cloudinary
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setUploading(true);

    const uploadedUrls = [];

    for (const file of files) {
      const cloudName = "dbagrlzha"; // from dashboard
      const uploadPreset = "sudeep"; // the one you created
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        console.log("Cloudinary response:", data); // Log the response for debugging
        

        if (data.secure_url) {
          uploadedUrls.push(data.secure_url); // Add the image URL to the list
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        toast.error("Failed to upload image.");
      }
    }

    setImageUrls(uploadedUrls); // Update the image URLs state with Cloudinary URLs
    setUploading(false);
    
    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
    } else if (files.length > 0) {
      toast.error("Failed to upload images. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create product function
  const createProduct = async (productData) => {
    try {
      const token = authAPI.getToken(); // Assuming this function exists to get auth token
      const response = await fetch(`${API_URL}/auction/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      console.log('API Response:', response);
      console.log("product data: ", productData) // Log the response for debugging
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
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

      // Prepare product data with image URLs
      const newProduct = {
        ...formData,
        image_urls: imageUrls
      };

      // Create the product using the new function
      const product = await createProduct(newProduct);

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
                    onClick={() => {
                      setImages(images.filter((_, i) => i !== index));
                      setImageUrls(imageUrls.filter((_, i) => i !== index));
                    }}
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

        {/* Upload status indicator */}
        {uploading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-blue-600">Uploading images...</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/my-listings")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formComplete}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formComplete && !loading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Adding..." : uploading ? "Please wait..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;