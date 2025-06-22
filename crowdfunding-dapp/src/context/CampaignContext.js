import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from './EthereumContext';
import { getCampaignContract } from '../hooks/useContract';
import { formatCampaign } from '../utils/helpers';
import { useCallback, useMemo } from 'react';

const CampaignContext = createContext();

export const CampaignProvider = ({ children }) => {
  const { provider, signer, address } = useEthereum();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  const contract = useMemo(() => {
    return getCampaignContract(provider);
  }, [provider]);

  const fetchCampaigns = useCallback(async () => {
    if (!contract) return;

    setIsLoading(true);
    setError(null);

    try {
      const count = await contract.campaignCount();
      const campaignArray = [];

      for (let i = 1; i <= count; i++) {
        const campaignData = await contract.campaigns(i);
        const formattedCampaign = formatCampaign(campaignData, i);
        campaignArray.push(formattedCampaign);
      }

      setCampaigns(campaignArray);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  const fetchCampaignDetails = async (id) => {
    if (!contract) return null;
    
    try {
      const campaignData = await contract.campaigns(id);
      return formatCampaign(campaignData, id);
    } catch (err) {
      console.error("Error fetching campaign details:", err);
      return null;
    }
  };

  const getUserContribution = useCallback(async (campaignId, userAddress) => {
    if (!contract) return 0n;
    try {
      const contribution = await contract.contributions(campaignId, userAddress);
      return contribution;
    } catch (err) {
      console.error(`Error fetching contribution for campaign ${campaignId} and user ${userAddress}:`, err);
      return 0n;
    }
  }, [contract]);

  const createCampaign = async (campaignData) => {
    if (!contract || !signer) {
      console.error("Contract or signer not available.");
      throw new Error("Wallet not connected or contract not initialized.");
    }
    
    try {
      const tx = await contract.connect(signer).createCampaign(
        campaignData.title,
        campaignData.description,
        campaignData.imageURL,
        ethers.parseEther(campaignData.fundingGoal.toString()),
        campaignData.deadline
      );
      
      await tx.wait();
      await fetchCampaigns(); 
      return true;
    } catch (err) {
      console.error("Error creating campaign:", err);
      throw err; 
    }
  };

  const contribute = async (campaignId, amount) => {
    if (!contract || !signer) {
      console.error("Contract or signer not available.");
      throw new Error("Wallet not connected or contract not initialized.");
    }
    
    try {
      const tx = await contract.connect(signer).contribute(campaignId, {
        value: ethers.parseEther(amount.toString())
      });
      
      await tx.wait();
      await fetchCampaigns();
      return true;
    } catch (err) {
      console.error("Error contributing to campaign:", err);
      throw err;
    }
  };

  const releaseOrRefund = async (campaignId) => {
    if (!contract || !signer) {
      console.error("Contract or signer not available.");
      throw new Error("Wallet not connected or contract not initialized.");
    }
    
    try {
      const tx = await contract.connect(signer).releaseOrRefund(campaignId);
      await tx.wait();
      await fetchCampaigns(); 
      return true;
    } catch (err) {
      console.error("Error releasing/refunding:", err);
      throw err;
    }
  };

  // Memoize filtered campaigns for performance, re-calculating only when dependencies change
  const filteredCampaigns = useMemo(() => {
    // Removed debugging logs for cleaner console
    // console.log(`--- Filtering Campaigns ---`);
    // console.log(`  Current Filter: "${filter}"`);
    // console.log(`  Current Search Term: "${searchTerm}"`);

    return campaigns.filter(campaign => {
      let matchesFilter = true;
      let matchesSearch = true;

      // Apply status filter - IMPORTANT: Convert both to lowercase for comparison
      if (filter !== 'all') {
        matchesFilter = campaign.status.toLowerCase() === filter.toLowerCase();
        // Removed debugging logs for cleaner console
        // console.log(`  Campaign ID: ${campaign.id}, Status: "${campaign.status}", Filter: "${filter}", Matches Filter? ${matchesFilter}`);
      }
      
      // Apply search term (case-insensitive)
      if (searchTerm) {
        matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
        // Removed debugging logs for cleaner console
        // console.log(`  Campaign ID: ${campaign.id}, Title: "${campaign.title}", Matches Search "${searchTerm}"? ${matchesSearch}`);
      }
      
      // Keep campaign if both filter and search match
      const shouldKeep = matchesFilter && matchesSearch;
      // Removed debugging logs for cleaner console
      // console.log(`  Campaign ID: ${campaign.id}, Should Keep? ${shouldKeep}`);
      return shouldKeep;
    });
  }, [campaigns, filter, searchTerm]); // Dependencies for useMemo

  // Effect hook to fetch campaigns on initial load and set up event listeners
  useEffect(() => {
    if (contract && address) {
      fetchCampaigns(); // Initial fetch

      const onCampaignCreated = (id, creator, title, description, imageURL, fundingGoal, deadline) => {
        console.log(`New campaign created: ${title} by ${creator}`);
        fetchCampaigns();
      };
      
      const onContribution = (campaignId, backer, amount) => {
        console.log(`New contribution to campaign ${campaignId}: ${ethers.formatEther(amount)} ETH from ${backer}`);
        fetchCampaigns();
      };
      
      contract.on('CampaignCreated', onCampaignCreated);
      contract.on('ContributionMade', onContribution);
      
      return () => {
        contract.off('CampaignCreated', onCampaignCreated);
        contract.off('ContributionMade', onContribution);
      };
    }
  }, [contract, address, fetchCampaigns]);

  return (
    <CampaignContext.Provider value={{
      campaigns: filteredCampaigns, // This now reflects the filtered list
      isLoading,
      error,
      filter,
      setFilter,
      searchTerm,
      setSearchTerm, 
      fetchCampaignDetails,
      createCampaign,
      contribute,
      releaseOrRefund,
      fetchCampaigns,
      getUserContribution
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => useContext(CampaignContext);
