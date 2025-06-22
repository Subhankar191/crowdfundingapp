import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEthereum } from '../context/EthereumContext';
import { useCampaigns } from '../context/CampaignContext';
import Loader from '../components/common/Loader';
import { formatDate, daysRemaining } from '../utils/helpers';

const CampaignDetails = () => {
  const { id } = useParams();
  const { address, signer } = useEthereum();
  const { fetchCampaignDetails, contribute, releaseOrRefund } = useCampaigns();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const data = await fetchCampaignDetails(id);
        setCampaign(data);
      } catch (err) {
        console.error("Error loading campaign:", err);
        setError("Failed to load campaign details");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCampaign();
  }, [id, fetchCampaignDetails]);

  const handleContribute = async () => {
    if (!contributionAmount || isNaN(contributionAmount)) {
      setError("Please enter a valid amount");
      return;
    }
    
    setIsContributing(true);
    setError(null);
    
    try {
      await contribute(id, contributionAmount);
      // Refresh campaign data
      const updatedCampaign = await fetchCampaignDetails(id);
      setCampaign(updatedCampaign);
      setContributionAmount('');
    } catch (err) {
      setError(err.message || "Failed to contribute");
    } finally {
      setIsContributing(false);
    }
  };

  const handleReleaseOrRefund = async () => {
    setIsReleasing(true);
    setError(null);
    
    try {
      await releaseOrRefund(id);
      // Refresh campaign data
      const updatedCampaign = await fetchCampaignDetails(id);
      setCampaign(updatedCampaign);
    } catch (err) {
      setError(err.message || "Failed to process");
    } finally {
      setIsReleasing(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!campaign) return <div className="text-center mt-8">Campaign not found</div>;

  const progress = (campaign.amountRaised / campaign.fundingGoal) * 100;
  const daysLeft = daysRemaining(campaign.deadline);
  const isCreator = address && address.toLowerCase() === campaign.creator.toLowerCase();
  const isActive = campaign.status === 'Active';
  const canContribute = isActive && daysLeft > 0;
  const canRelease = isCreator && campaign.status === 'Successful';
  const canRefund = !isCreator && campaign.status === 'Failed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={campaign.imageURL || '/default-campaign.jpg'} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 md:w-1/2">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
              <span className={`px-3 py-1 text-sm rounded-full ${
                campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                campaign.status === 'Successful' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {campaign.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">{campaign.description}</p>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Creator:</span>
                <span className="text-gray-600">{campaign.creator}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Deadline:</span>
                <span className="text-gray-600">{formatDate(campaign.deadline)} ({daysLeft > 0 ? `${daysLeft} days left` : 'Ended'})</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">
                  Raised: {campaign.amountRaised.toFixed(2)} ETH
                </span>
                <span className="text-gray-700 font-medium">
                  Goal: {campaign.fundingGoal.toFixed(2)} ETH
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-500">
                {progress.toFixed(1)}% funded
              </p>
            </div>
            
            {canContribute && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="Amount in ETH"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleContribute}
                    disabled={isContributing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isContributing ? 'Processing...' : 'Contribute'}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            )}
            
            {(canRelease || canRefund) && (
              <button
                onClick={handleReleaseOrRefund}
                disabled={isReleasing}
                className={`w-full px-4 py-2 rounded-md text-white ${
                  canRelease ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {isReleasing ? 'Processing...' : 
                 canRelease ? 'Release Funds' : 'Claim Refund'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;