import React, { useState, useEffect } from 'react';

const ApplicantsModal = ({ show, onClose, applicants, jobId }) => {
  const [listingStatus, setListingStatus] = useState(''); // Default to empty string

  useEffect(() => {
    if (show && jobId) {
      fetchListingStatus();
    }
  }, [show, jobId]);

  const fetchListingStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/listings/status/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listing status');
      }
      const data = await response.json();
      setListingStatus(data.status);
    } catch (err) {
      console.error('Error fetching listing status:', err);
    }
  };

  const handleCloseListing = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/listings/close/${jobId}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to close listing');
      }
      setListingStatus('Closed');
    } catch (err) {
      console.error('Error closing listing:', err);
    }
  };

  const handleReopenListing = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/listings/reopen/${jobId}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to reopen listing');
      }
      setListingStatus('Open');
    } catch (err) {
      console.error('Error reopening listing:', err);
    }
  };

  const handleCloseModal = () => {
    setListingStatus(''); // Reset to default when modal is closed
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4">
        <h2 className="text-2xl font-semibold mb-4">Applicants</h2>
        {applicants.length > 0 ? (
          <div className="overflow-y-auto max-h-96">
            {applicants.map((applicant) => (
              <div key={applicant.application_id} className="mb-4 p-4 border rounded">
                <h3 className="text-xl font-semibold">{applicant.name}</h3>
                <p><strong>Email:</strong> {applicant.email}</p>
                <p><strong>Phone:</strong> {applicant.phone_number || "No Number"}</p>
                <p><strong>Bio:</strong> {applicant.bio || "No Bio"}</p>
                <p><strong>Tell me about yourself:</strong> {applicant.tell_answer}</p>
                <p><strong>Why are you fit for this job:</strong> {applicant.fit_answer}</p>
                <p><strong>Most ambitious job completed:</strong> {applicant.ambitious_answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No applicants found.</p>
        )}
        <div className="flex justify-end mt-4">
          {listingStatus.toLocaleLowerCase() === 'open' ? (
            <button
              onClick={handleCloseListing}
              className="mr-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close Listing
            </button>
          ) : (
            <button
              onClick={handleReopenListing}
              className="mr-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Reopen Listing
            </button>
          )}
          <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsModal;