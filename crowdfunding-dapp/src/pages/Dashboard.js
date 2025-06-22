import { useState, useEffect } from 'react';
import { useEthereum } from '../context/EthereumContext';
import { useCampaigns } from '../context/CampaignContext';
import CreatorDashboard from '../components/dashboard/CreatorDashboard';
import BackerDashboard from '../components/dashboard/BackerDashboard';
import Loader from '../components/common/Loader';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { address, isLoading: isWalletLoading } = useEthereum();
  const { campaigns, isLoading: isCampaignsLoading } = useCampaigns();
  const [activeTab, setActiveTab] = useState('created');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Wait for all data to load before rendering
  useEffect(() => {
    if (!isWalletLoading && !isCampaignsLoading) { 
      setIsInitialLoad(false);
    }
  }, [isWalletLoading, isCampaignsLoading]);

  // Show loader during initial load
  if (isInitialLoad) {
    return <Loader />;
  }

  // Show connect wallet message if not connected
  if (!address) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Please connect your wallet to view your dashboard
        </h2>
      </div>
    );
  }

  const createdCampaigns = campaigns.filter(c => c.creator.toLowerCase() === address.toLowerCase());
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8"> {/* Added flex container */}
        <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
        {/* Moved the "New Campaign" button here to be always visible */}
        {activeTab === 'created' && ( // Only show when 'Your Campaigns' tab is active
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Campaign
          </Link>
        )}
      </div>
    
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'created' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Campaigns ({createdCampaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('backed')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'backed' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Backed Campaigns
            </button>
          </nav>
        </div>
      
        <div className="p-6">
          {activeTab === 'created' ? (
            // Now, CreatorDashboard will always be rendered if there are campaigns,
            // and the "No campaigns created" message will appear otherwise.
            // The "New Campaign" button is handled above the tabs.
            createdCampaigns.length === 0 ? (
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
                <h3 className="mt-2 text-lg font-medium text-gray-900">No campaigns created</h3>
                <p className="mt-1 text-gray-500">
                  Get started by creating your first crowdfunding campaign.
                </p>
              </div>
            ) : (
              <CreatorDashboard campaigns={createdCampaigns} />
            )
          ) : (
            <BackerDashboard />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;