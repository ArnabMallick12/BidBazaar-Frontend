import { useEffect } from 'react';
import ActiveAuctions from '../components/ActiveAuctions';

const ActiveAuctionsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Active Auctions</h1>
        <p className="mt-2 text-gray-600">
          Browse through all active auctions, sorted by end time
        </p>
      </div>
      <ActiveAuctions />
    </div>
  );
};

export default ActiveAuctionsPage; 