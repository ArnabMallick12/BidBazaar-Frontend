import { useState } from 'react';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';

const BidForm = ({ productId, startingPrice, highestBid, onBidPlaced }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amount = parseFloat(bidAmount);
      
      // Validate bid amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid bid amount");
      }

      if (amount < startingPrice) {
        throw new Error(`Bid amount must be at least Rs.${startingPrice}`);
      }

      if (highestBid && amount <= highestBid) {
        throw new Error(`Bid amount must be higher than the current highest bid (Rs.${highestBid})`);
      }

      // Validate dates
      if (!startDate || !endDate) {
        throw new Error("Please select both start and end dates");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start < now) {
        throw new Error("Start date cannot be in the past");
      }

      if (end <= start) {
        throw new Error("End date must be after start date");
      }

      await auctionAPI.placeBid(productId, amount, startDate, endDate);
      onBidPlaced();
    } catch (err) {
      console.error("Error placing bid:", err);
      setError(err.response?.data?.message || err.message || "Failed to place bid");
      toast.error(err.response?.data?.message || err.message || "Failed to place bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
          Bid Amount (Rs.)
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="bidAmount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            min={startingPrice}
            step="0.01"
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder={`Minimum Rs.${startingPrice}`}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {highestBid
            ? `Current highest bid: Rs.${highestBid}`
            : `Starting price: Rs.${startingPrice}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <div className="mt-1">
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate || new Date().toISOString().slice(0, 16)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onBidPlaced(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Placing Bid..." : "Place Bid"}
        </button>
      </div>
    </form>
  );
};

export default BidForm;
