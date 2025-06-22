import { useState, useEffect, useCallback } from 'react';
import { useEthereum } from '../context/EthereumContext';
import { getCampaignContract } from './useContract';

export const useCampaigns = () => {
  const { provider, address } = useEthereum();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    const contract = getCampaignContract(provider);
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const count = await contract.campaignCount();

      const campaignArray = [];

      for (let i = 1; i <= count; i++) {
        const campaign = await contract.campaigns(i);
        campaignArray.push({
          id: i,
          title: campaign.title,
          creator: campaign.creator,
          status: campaign.status,
        });
      }

      setCampaigns(campaignArray);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns
  };
};