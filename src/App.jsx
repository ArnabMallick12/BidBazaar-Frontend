import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
// import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import AddProduct from './pages/AddProduct';
import ActiveAuctions from './pages/ActiveAuctions';
import MyListings from './pages/MyListings';
import MyBids from './pages/MyBids';
import { authAPI } from './api/auth';

// ProtectedRoute component inline for simplicity
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/product/:id" element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } />
            <Route path="/add-product" element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            } />
            <Route path="/my-listings" element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            } />
            <Route path="/my-bids" element={
              <ProtectedRoute>
                <MyBids />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route - redirect to home or login page */}
            <Route path="*" element={
              authAPI.isAuthenticated() ? 
                <Navigate to="/" replace /> : 
                <Navigate to="/login" replace />
            } />
          </Routes>
        </main>
        {/* <Footer /> */}
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
