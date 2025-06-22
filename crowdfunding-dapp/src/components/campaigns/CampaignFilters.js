import { useCampaigns } from '../../context/CampaignContext';

const CampaignFilters = () => {
  const { filter, setFilter, searchTerm, setSearchTerm } = useCampaigns();

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Campaigns</option>
          <option value="Active">Active</option>
          <option value="Successful">Successful</option>
          <option value="Failed">Failed</option>
        </select>
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md flex-grow"
        />
      </div>
    </div>
  );
};

export default CampaignFilters;