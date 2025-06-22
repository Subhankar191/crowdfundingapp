import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEthereum } from '../context/EthereumContext';
import { useCampaigns } from '../context/CampaignContext';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { address } = useEthereum();
  const { createCampaign } = useCampaigns();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageURL: '',
    fundingGoal: '',
    deadline: '' 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getMinDatetimeLocal = () => {
    const now = new Date();
    // Set minimum to be current time + a buffer (e.g., 5 minutes)
    now.setMinutes(now.getMinutes() + 5); 
    // Format to YYYY-MM-DDTHH:MM for datetime-local input
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!address) {
      setError('Please connect your wallet to create a campaign.');
      return;
    }

    try {
      setIsSubmitting(true);

      const parsedGoal = parseFloat(formData.fundingGoal);
      if (isNaN(parsedGoal) || parsedGoal < 0.01) {
        throw new Error('Funding goal must be at least 0.01 ETH.');
      }

      const selectedDeadline = new Date(formData.deadline);

      // Validate if the date object was successfully created
      if (isNaN(selectedDeadline.getTime())) {
          throw new Error('Invalid deadline date. Please select a valid date and time.');
      }

      // Convert to Unix timestamp (seconds since epoch)
      const deadlineTimestamp = Math.floor(selectedDeadline.getTime() / 1000);

      // Get current client-side Unix timestamp (seconds since epoch) for comparison
      const nowClientTimestamp = Math.floor(Date.now() / 1000);

      // Add a buffer (e.g., 5 minutes = 300 seconds) to account for network latency and block time
      // The blockchain's block.timestamp is in seconds (UTC).
      const minimumFutureDeadline = nowClientTimestamp + (5 * 60); // 5 minutes buffer

      if (deadlineTimestamp <= minimumFutureDeadline) {
          throw new Error(`Deadline must be at least 5 minutes in the future (current time: ${new Date(nowClientTimestamp * 1000).toLocaleString()}, chosen deadline: ${selectedDeadline.toLocaleString()}).`);
      }

      await createCampaign({
        ...formData,
        fundingGoal: parsedGoal,
        deadline: deadlineTimestamp, 
      });

      setSuccess('Campaign created successfully!');
      navigate('/campaigns');
    } catch (err) {
      console.error('Error creating campaign:', err);
      let errorMessage = err.message || 'Failed to create campaign';
      // Attempt to extract more specific error messages from contract reverts (ethers.js v6)
      if (err.data && err.data.message) {
          errorMessage = err.data.message; 
      } else if (err.reason) { // Another common field for revert reasons
          errorMessage = err.reason;
      } else if (err.code === 'CALL_EXCEPTION' && err.error && err.error.message) {
          // This captures the exact message from the Solidity revert
          // Example: "execution reverted: \"Deadline must be in the future\""
          const match = err.error.message.match(/execution reverted: "(.*?)"/);
          if (match && match[1]) {
              errorMessage = match[1];
          } else {
              errorMessage = err.error.message;
          }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!address) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Please connect your wallet to create a campaign
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded" role="alert" aria-live="assertive">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block font-medium mb-1">Campaign Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="description" className="block font-medium mb-1">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="imageURL" className="block font-medium mb-1">Image URL *</label>
            <input
              type="url"
              id="imageURL"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            {formData.imageURL && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Image Preview:</p>
                <img
                  src={formData.imageURL}
                  alt="Campaign preview"
                  className="h-32 mt-1 object-cover border rounded"
                  onError={(e) => {
                    e.target.src = '/fallback.jpg'; // Ensure you have a fallback image
                    e.target.alt = 'Image failed to load';
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fundingGoal" className="block font-medium mb-1">Funding Goal (ETH) *</label>
              <input
                type="number"
                id="fundingGoal"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block font-medium mb-1">Deadline *</label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                min={getMinDatetimeLocal()} 
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;