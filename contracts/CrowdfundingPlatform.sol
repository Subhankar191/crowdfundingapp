// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrowdfundingPlatform is ReentrancyGuard {   
    enum CampaignStatus {
        Active,
        Successful,
        Failed,
        PaidOut,
        Refunded
    }

    struct Campaign {
        uint256 id;
        address payable creator;
        string title;
        string description;
        string imageURL;
        uint256 fundingGoal;
        uint256 amountRaised;
        uint256 deadline;
        CampaignStatus status;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    // Events
    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string description,
        string imageURL,
        uint256 fundingGoal,
        uint256 deadline
    );

    event ContributionMade(
        uint256 indexed campaignId,
        address indexed backer,
        uint256 amount
    );

    event FundsReleased(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    event RefundIssued(
        uint256 indexed campaignId,
        address indexed backer,
        uint256 amount
    );

    // Modifiers
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        Campaign storage c = campaigns[_campaignId];
        require(block.timestamp < c.deadline, "Campaign has ended");
        require(c.status == CampaignStatus.Active, "Campaign is not active");
        _;
    }

    modifier campaignEnded(uint256 _campaignId) {
        Campaign storage c = campaigns[_campaignId];
        require(block.timestamp >= c.deadline, "Campaign not ended yet");
        require(c.status == CampaignStatus.Active, "Campaign already finalized");
        _;
    }

    modifier onlyCreator(uint256 _campaignId) {
        require(msg.sender == campaigns[_campaignId].creator, "Only creator allowed");
        _;
    }

    // Create a new crowdfunding campaign
    function createCampaign(
        string calldata _title,
        string calldata _description,
        string calldata _imageURL,
        uint256 _fundingGoal,
        uint256 _deadline
    ) external {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_imageURL).length > 0, "Image URL required");
        require(_fundingGoal > 0, "Funding goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            imageURL: _imageURL,
            fundingGoal: _fundingGoal,
            amountRaised: 0,
            deadline: _deadline,
            status: CampaignStatus.Active
        });

        emit CampaignCreated(
            campaignCount,
            msg.sender,
            _title,
            _description,
            _imageURL,
            _fundingGoal,
            _deadline
        );
    }

    // Contribute ETH to a campaign
    function contribute(uint256 _campaignId)
        external
        payable
        nonReentrant
        campaignExists(_campaignId)
        campaignActive(_campaignId)
    {
        require(msg.value > 0, "Contribution must be > 0");

        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Active, "Campaign not accepting contributions");

        campaign.amountRaised += msg.value;
        contributions[_campaignId][msg.sender] += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

    // Creator withdraws funds if goal reached and deadline passed
    function releaseFunds(uint256 _campaignId)
        external
        nonReentrant
        campaignExists(_campaignId)
        campaignEnded(_campaignId)
        onlyCreator(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Active, "Funds already released or refunded");
        require(campaign.amountRaised >= campaign.fundingGoal, "Funding goal not met");

        campaign.status = CampaignStatus.PaidOut;
        uint256 amount = campaign.amountRaised;

        (bool success, ) = campaign.creator.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_campaignId, campaign.creator, amount);
    }

    // Backers claim refund if campaign failed
    function claimRefund(uint256 _campaignId)
        external
        nonReentrant
        campaignExists(_campaignId)
        campaignEnded(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Active, "Campaign not eligible for refund");
        require(campaign.amountRaised < campaign.fundingGoal, "Funding goal was met");
        
        uint256 contributed = contributions[_campaignId][msg.sender];
        require(contributed > 0, "No contributions to refund");

        contributions[_campaignId][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: contributed}("");
        require(success, "Refund transfer failed");

        emit RefundIssued(_campaignId, msg.sender, contributed);
    }

    // Combined release or refund function for convenience
    function releaseOrRefund(uint256 _campaignId)
        external
        nonReentrant
        campaignExists(_campaignId)
        campaignEnded(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Active, "Funds already released or refunded");

        uint256 contributed = contributions[_campaignId][msg.sender];

        // Refund logic for backers if goal not met
        if (contributed > 0 && campaign.amountRaised < campaign.fundingGoal) {
            contributions[_campaignId][msg.sender] = 0;

            (bool success, ) = payable(msg.sender).call{value: contributed}("");
            require(success, "Refund transfer failed");

            emit RefundIssued(_campaignId, msg.sender, contributed);
            return;
        }

        // Release funds logic for creator if goal met
        if (msg.sender == campaign.creator) {
            require(campaign.amountRaised >= campaign.fundingGoal, "Funding goal not met");

            campaign.status = CampaignStatus.PaidOut;
            uint256 amount = campaign.amountRaised;

            (bool success, ) = campaign.creator.call{value: amount}("");
            require(success, "Transfer failed");

            emit FundsReleased(_campaignId, campaign.creator, amount);
            return;
        }

        revert("Not eligible for refund or release");
    }

    // View campaign details with status and image URL
    function getCampaignDetails(uint256 _campaignId)
        external
        view
        campaignExists(_campaignId)
        returns (
            address creator,
            string memory title,
            string memory description,
            string memory imageURL,
            uint256 fundingGoal,
            uint256 amountRaised,
            uint256 deadline,
            CampaignStatus status
        )
    {
        Campaign storage c = campaigns[_campaignId];
        return (
            c.creator,
            c.title,
            c.description,
            c.imageURL,
            c.fundingGoal,
            c.amountRaised,
            c.deadline,
            c.status
        );
    }

    // Check how much a backer contributed to a campaign
    function getContribution(uint256 _campaignId, address _backer)
        external
        view
        campaignExists(_campaignId)
        returns (uint256)
    {
        return contributions[_campaignId][_backer];
    }

    // Check if a user can claim a refund for a campaign
    function canRefund(uint256 _campaignId, address _user)
        external
        view
        campaignExists(_campaignId)
        returns (bool)
    {
        Campaign storage c = campaigns[_campaignId];
        return (
            block.timestamp >= c.deadline &&
            c.amountRaised < c.fundingGoal &&
            contributions[_campaignId][_user] > 0 &&
            c.status == CampaignStatus.Active
        );
    }
}