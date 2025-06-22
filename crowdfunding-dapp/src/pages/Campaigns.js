import { useState, useEffect } from 'react';
import { useEthereum } from '../context/EthereumContext';
import { useCampaigns } from '../context/CampaignContext';
import CampaignCard from '../components/campaigns/CampaignCard';
import CampaignFilters from '../components/campaigns/CampaignFilters';
import Loader from '../components/common/Loader';

const Campaigns = () => {
  const { isLoading: isWalletLoading } = useEthereum();
  const { campaigns, isLoading: isCampaignsLoading, error } = useCampaigns();
  const [viewMode, setViewMode] = useState('grid');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Synchronize loading states
  useEffect(() => {
    if (!isWalletLoading && !isCampaignsLoading) {
      setIsInitialLoad(false);
    }
  }, [isWalletLoading, isCampaignsLoading]);

  if (isInitialLoad) return <Loader />;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Campaigns</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            List
          </button>
        </div>
      </div>
      
      <CampaignFilters />
      
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-gray-500">
            Please connect metamask wallet<br/>
            OR<br/>
            Be the first to create a campaign!
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-6"
        }>
          {campaigns.map(campaign => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;