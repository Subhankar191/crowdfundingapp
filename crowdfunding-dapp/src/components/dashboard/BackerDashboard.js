import { useState, useEffect } from 'react';
import { useEthereum } from '../../context/EthereumContext';
import { useCampaigns } from '../../context/CampaignContext';
import { formatDate, formatAddress } from '../../utils/helpers'; 
import Loader from '../common/Loader'; 
import { ethers } from 'ethers'; 

const BackerDashboard = () => {
  const { address } = useEthereum();
  // Destructure releaseOrRefund and getUserContribution from useCampaigns
  const { campaigns, isLoading: isCampaignsLoading, releaseOrRefund, getUserContribution } = useCampaigns();
  
  const [backedCampaignsWithDetails, setBackedCampaignsWithDetails] = useState([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(true);
  const [actionStatus, setActionStatus] = useState({}); // To track loading/error for individual actions

  useEffect(() => {
    const fetchBackedCampaignsDetails = async () => {
      if (!address || !campaigns.length) {
        setIsLoadingContributions(false);
        return;
      }

      setIsLoadingContributions(true);
      const backed = [];
      for (const campaign of campaigns) {
        try {
          // Fetch the current user's specific contribution to this campaign
          // Assuming getUserContribution is available in CampaignContext
          const userContributionBigInt = await getUserContribution(campaign.id, address);

          // Only add to backed campaigns if the user actually contributed
          if (userContributionBigInt > 0) {
            backed.push({ 
              ...campaign, 
              // Convert BigInt contribution to a readable ETH string
              userContribution: parseFloat(ethers.formatEther(userContributionBigInt)) 
            });
          }
        } catch (e) {
          console.error(`Error fetching contribution for campaign ${campaign.id}:`, e);
          // Handle error for individual campaign fetch if necessary
        }
      }
      setBackedCampaignsWithDetails(backed);
      setIsLoadingContributions(false);
    };
    
    // Only fetch if campaigns are loaded and address is available
    if (!isCampaignsLoading && address) {
      fetchBackedCampaignsDetails();
    }
  }, [address, campaigns, isCampaignsLoading, getUserContribution]); // Add getUserContribution to dependencies

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

  if (isCampaignsLoading || isLoadingContributions) {
    return <Loader />; 
  }

  if (backedCampaignsWithDetails.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't backed any campaigns yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaigns You've Backed</h2>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Contribution
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {backedCampaignsWithDetails.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={campaign.imageURL || 'https://placehold.co/40x40/cccccc/333333?text=No+Img'} // Fallback image
                        alt={campaign.title}
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40/cccccc/333333?text=No+Img'; }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                      <div className="text-xs text-gray-500">By: {formatAddress(campaign.creator)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{campaign.userContribution} ETH</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    campaign.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    campaign.status === 'Successful' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800' // For PaidOut/Refunded
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(campaign.deadline)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* View Campaign Link */}
                  <a href={`/campaigns/${campaign.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    View
                  </a>

                  {/* Claim Refund Button */}
                  {campaign.status === 'Failed' && campaign.userContribution > 0 && (
                    <button
                      onClick={() => handleReleaseOrRefund(campaign.id)}
                      disabled={actionStatus[campaign.id] === 'processing'}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {actionStatus[campaign.id] === 'processing' ? 'Claiming...' : 'Claim Refund'}
                    </button>
                  )}
                  {actionStatus[campaign.id] && actionStatus[campaign.id].startsWith('error') && (
                    <p className="text-red-500 text-xs mt-1">{actionStatus[campaign.id].replace('error: ', '')}</p>
                  )}
                  {actionStatus[campaign.id] === 'success' && (
                    <p className="text-green-600 text-xs mt-1">Action successful!</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BackerDashboard;