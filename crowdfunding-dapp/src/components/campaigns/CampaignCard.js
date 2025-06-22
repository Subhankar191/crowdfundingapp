import { Link } from 'react-router-dom';
import { formatDate, daysRemaining } from '../../utils/helpers';

const CampaignCard = ({ campaign }) => {
  const progress = (campaign.amountRaised / campaign.fundingGoal) * 100;
  const daysLeft = daysRemaining(campaign.deadline);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        <img 
          src={campaign.imageURL || '/default-campaign.jpg'} 
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {campaign.title}
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
            campaign.status === 'Successful' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {campaign.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">
              Raised: {campaign.amountRaised.toFixed(2)} ETH
            </span>
            <span className="text-gray-500">
              Goal: {campaign.fundingGoal.toFixed(2)} ETH
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Ends: {formatDate(campaign.deadline)}</span>
          <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
        </div>
        
        <Link
          to={`/campaigns/${campaign.id}`}
          className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;