import { Link } from 'react-router-dom';
import { daysRemaining } from '../../utils/helpers';
import { useCampaigns } from '../../context/CampaignContext'; 
import { useState } from 'react'; 

const CreatorDashboard = ({ campaigns }) => {
  const { releaseOrRefund } = useCampaigns(); // Get the releaseOrRefund function from context
  const [actionStatus, setActionStatus] = useState({}); // State to manage action feedback

  const handleReleaseOrRefund = async (campaignId) => {
    setActionStatus(prev => ({ ...prev, [campaignId]: 'processing' }));
    try {
      await releaseOrRefund(campaignId);
      setActionStatus(prev => ({ ...prev, [campaignId]: 'success' }));
      // The releaseOrRefund in CampaignContext already calls fetchCampaigns()
      // which will trigger a re-render here with updated campaign status.
    } catch (err) {
      console.error("Error with release/refund:", err);
      let errorMessage = err.message || 'Failed to process action.';
      if (err.reason) errorMessage = err.reason;
      else if (err.data && err.data.message) errorMessage = err.data.message;
      else if (err.code === 'CALL_EXCEPTION' && err.error && err.error.message) {
          const match = err.error.message.match(/execution reverted: "(.*?)"/);
          if (match && match[1]) errorMessage = match[1];
          else errorMessage = err.error.message;
      }
      setActionStatus(prev => ({ ...prev, [campaignId]: `error: ${errorMessage}` }));
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't created any campaigns yet.</p>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Your First Campaign
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="h-40 overflow-hidden">
              <img 
                src={campaign.imageURL || 'https://placehold.co/400x160/cccccc/333333?text=No+Image'} // Fallback image
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/400x160/cccccc/333333?text=No+Image'; }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <Link to={`/campaigns/${campaign.id}`} className="hover:text-blue-600">
                  {campaign.title}
                </Link>
              </h3>
              
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Status: {campaign.status}</span>
                <span>{daysRemaining(campaign.deadline)} days left</span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Raised: {campaign.amountRaised.toFixed(2)} ETH</span>
                  <span>Goal: {campaign.fundingGoal.toFixed(2)} ETH</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        (campaign.amountRaised / campaign.fundingGoal) * 100, 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Action Buttons for Creator */}
              <div className="mt-4">
                {campaign.status === 'Successful' && (
                  <button
                    onClick={() => handleReleaseOrRefund(campaign.id)}
                    disabled={actionStatus[campaign.id] === 'processing'}
                    className="block w-full text-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionStatus[campaign.id] === 'processing' ? 'Releasing Funds...' : 'Release Funds'}
                  </button>
                )}
                {/* You can add other creator actions here, e.g., Edit Campaign (if implemented) */}
                <Link
                  to={`/campaigns/${campaign.id}`}
                  className="block text-center mt-2 px-3 py-2 border border-blue-600 text-blue-600 text-sm rounded-md hover:bg-blue-50"
                >
                  View Campaign
                </Link>
              </div>
              {actionStatus[campaign.id] && actionStatus[campaign.id].startsWith('error') && (
                <p className="text-red-500 text-xs mt-1 text-center">{actionStatus[campaign.id].replace('error: ', '')}</p>
              )}
              {actionStatus[campaign.id] === 'success' && (
                <p className="text-green-600 text-xs mt-1 text-center">Action successful!</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorDashboard;
