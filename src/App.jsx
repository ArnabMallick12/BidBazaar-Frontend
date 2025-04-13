import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import AddProduct from './pages/AddProduct';
import ActiveAuctions from './pages/ActiveAuctions';
import MyListings from './pages/MyListings';
import ProtectedRoute from './components/ProtectedRoute';
import MyBidsPage from './pages/MyBids';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/active-auctions" element={<ActiveAuctions />} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/my-bids" element={<ProtectedRoute><MyBidsPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
