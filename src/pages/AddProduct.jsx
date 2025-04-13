import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";
import AddProductForm from "../components/AddProductForm";

const AddProduct = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <AddProductForm />
      </div>
    </div>
  );
};

export default AddProduct; 