import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useEthereum } from '../context/EthereumContext';
import contractABI from '../utils/contractABI.json';
import { CONTRACT_ADDRESS } from '../utils/constants';

export const getCampaignContract = (provider) => {
  if (!provider || !CONTRACT_ADDRESS) return null;
  
  try {
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI,
      provider
    );
  } catch (error) {
    console.error("Error creating contract instance:", error);
    return null;
  }
};

export const useContract = () => {
  const { provider, signer } = useEthereum();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (provider) {
      const campaignContract = getCampaignContract(signer || provider);
      setContract(campaignContract);
    }
  }, [provider, signer]);

  return contract;
};