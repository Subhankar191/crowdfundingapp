import { useState } from 'react';
import { useEthereum } from '../../context/EthereumContext';
import { useCampaigns } from '../../context/CampaignContext';
import { useNavigate } from 'react-router-dom';

const CampaignForm = ({ existingCampaign }) => {
  const { address } = useEthereum();
  const { createCampaign } = useCampaigns();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: existingCampaign?.title || '',
    description: existingCampaign?.description || '',
    imageURL: existingCampaign?.imageURL || '',
    fundingGoal: existingCampaign?.fundingGoal || '',
    deadline: existingCampaign?.deadline || '' 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null); 

    if (!address) {
      setError('Please connect your wallet to create a campaign.');
      setIsSubmitting(false);
      return;
    }

    try {
      const parsedGoal = parseFloat(formData.fundingGoal);
      if (isNaN(parsedGoal) || parsedGoal < 0.01) {
        throw new Error('Funding goal must be at least 0.01 ETH.');
      }

      // Parse the datetime-local string to a Date object
      const deadlineDate = new Date(formData.deadline); 
      
      // Validate if the date object was successfully created
      if (isNaN(deadlineDate.getTime())) {
          throw new Error('Invalid deadline date. Please select a valid date and time.');
      }

      // Convert to Unix timestamp (seconds since epoch)
      // getTime() returns milliseconds, so divide by 1000 for seconds.
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000); 

      // Get current client-side Unix timestamp (seconds since epoch) for comparison
      const nowClientTimestamp = Math.floor(Date.now() / 1000);

      // Add a buffer (e.g., 5 minutes = 300 seconds) to account for network latency and block time
      // The blockchain's block.timestamp is in seconds (UTC).
      const minimumFutureDeadline = nowClientTimestamp + (5 * 60); // 5 minutes buffer

      if (deadlineTimestamp <= minimumFutureDeadline) {
          throw new Error(`Deadline must be at least 5 minutes in the future (current time: ${new Date(nowClientTimestamp * 1000).toLocaleString()}, chosen deadline: ${deadlineDate.toLocaleString()}).`);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {success && <p className="text-green-600 font-medium">{success}</p>}

      <div>
        <label className="block font-semibold">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold">Image URL</label>
        <input
          type="url"
          value={formData.imageURL}
          onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Funding Goal (ETH)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.fundingGoal}
            onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Deadline</label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !address}
        className="primary-button"
      >
        {isSubmitting ? 'Processing...' : 'Submit Campaign'}
      </button>
    </form>
  );
};

export default CampaignForm;