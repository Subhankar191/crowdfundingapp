import { ethers } from 'ethers';

// This function formats raw campaign data from the smart contract
// into a more usable JavaScript object.
// It explicitly handles BigInt conversions for numerical values.
export const formatCampaign = (campaignData, id) => {
  // campaignData properties like fundingGoal, amountRaised, deadline, status
  // will be BigInts from ethers.js v6.

  return {
    id: Number(id), // Ensure ID is a regular number
    creator: campaignData.creator,
    title: campaignData.title,
    description: campaignData.description,
    imageURL: campaignData.imageURL,
    // Convert BigInt Wei to ETH string, then parseFloat to get a number for display/calculations
    fundingGoal: parseFloat(ethers.formatEther(campaignData.fundingGoal)),
    amountRaised: parseFloat(ethers.formatEther(campaignData.amountRaised)),
    // FIX: Convert BigInt deadline to Number before multiplying by 1000 for Date constructor
    // campaignData.deadline is in seconds, Date expects milliseconds.
    deadline: new Date(Number(campaignData.deadline) * 1000), 
    // Pass raw BigInts to getStatus, which will handle their conversion internally
    status: getStatus(
      campaignData.status, 
      campaignData.deadline, 
      campaignData.amountRaised, 
      campaignData.fundingGoal
    )
  };
};

// This function determines the campaign status based on various parameters.
// It receives BigInts for status, deadline, amountRaised, and fundingGoal,
// and performs necessary conversions for comparisons.
const getStatus = (statusBigInt, deadlineBigInt, amountRaisedBigInt, fundingGoalBigInt) => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds (Number)
  
  // Convert BigInt status to Number for direct comparison with enum values
  if (Number(statusBigInt) === 3) return 'PaidOut'; // Assuming 3 is PaidOut in your enum
  if (Number(statusBigInt) === 4) return 'Refunded'; // Assuming 4 is Refunded in your enum

  // Convert BigInt deadline to Number for comparison with 'now'
  if (now >= Number(deadlineBigInt)) {
    // Convert BigInt amounts (Wei) to ETH (string) then to Number for comparison
    const amountRaisedEth = parseFloat(ethers.formatEther(amountRaisedBigInt));
    const fundingGoalEth = parseFloat(ethers.formatEther(fundingGoalBigInt));

    if (amountRaisedEth >= fundingGoalEth) return 'Successful';
    return 'Failed';
  }
  return 'Active';
};

// Formats an Ethereum address for display (e.g., 0x1234...abcd)
export const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Formats a Date object into a localized date string
export const formatDate = (date) => {
  // Ensure 'date' is a valid Date object before calling toLocaleDateString
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculates the number of days remaining until a deadline
export const daysRemaining = (deadline) => {
  const now = new Date();
  // Ensure 'deadline' is a valid Date object
  if (!(deadline instanceof Date) || isNaN(deadline.getTime())) {
    return 0; // Or handle as an error/default value
  }
  const diff = deadline.getTime() - now.getTime(); // Difference in milliseconds
  // Return 0 if the deadline has passed, otherwise calculate days
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}