import React, { useState, useEffect } from 'react';

const Premium = ({ contractorId }) => {
  const [premiumStatus, setPremiumStatus] = useState('regular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPremiumStatus();
  }, [contractorId]);

  const fetchPremiumStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/premium/check/${contractorId}`);
      const data = await response.json();
      setPremiumStatus(data.is_premium ? 'premium' : 'regular');
    } catch (err) {
      setError('Error fetching premium status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/premium/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractor_id: contractorId, months: 1 }),
      });
      
      if (!response.ok) throw new Error('Subscription failed');
      
      fetchPremiumStatus();
    } catch (err) {
      setError('Error subscribing to premium');
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/premium/cancel/${contractorId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Cancellation failed');
      
      fetchPremiumStatus();
    } catch (err) {
      setError('Error canceling subscription');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Premium Status</h2>
      <p className="mb-4">
        Current Status: 
        <span className={`ml-2 font-bold ${premiumStatus === 'premium' ? 'text-green-600' : 'text-gray-600'}`}>
          {premiumStatus.toUpperCase()}
        </span>
      </p>
      
      {premiumStatus === 'regular' ? (
        <button
          onClick={handleSubscribe}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upgrade to Premium
        </button>
      ) : (
        <button
          onClick={handleCancel}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cancel Premium
        </button>
      )}
    </div>
  );
};

export default Premium;