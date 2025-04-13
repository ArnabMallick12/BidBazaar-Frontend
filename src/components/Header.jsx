import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";
import { toast } from "react-hot-toast";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = authAPI.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            BidBazaar
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              Home
            </Link>
            {user && (
              <>
                <Link to="/add-product" className="text-gray-600 hover:text-blue-600">
                  Add Product
                </Link>
                <Link to="/my-bids" className="text-gray-600 hover:text-blue-600">
                  My Bids
                </Link>
                <Link to="/my-listings" className="text-gray-600 hover:text-blue-600">
                  My Listings
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 focus:outline-none"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <span>{user.username}</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link
              to="/"
              className="block text-gray-600 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/add-product"
                  className="block text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Add Product
                </Link>
                <Link
                  to="/my-bids"
                  className="block text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bids
                </Link>
                <Link
                  to="/my-listings"
                  className="block text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Listings
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
