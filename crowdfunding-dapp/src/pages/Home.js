import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline'; // Updated import for v2

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Welcome to Our <span className="text-indigo-600">Crowdfunding</span> Platform
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your wallet to start exploring amazing campaigns or bring your creative ideas to life by launching your own!
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/campaigns"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              Explore Campaigns
            </Link>

            <Link
              to="/create"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-all duration-200 hover:shadow-md flex items-center justify-center"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Create Campaign
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { value: '1,200+', label: 'Active Campaigns' },
              { value: '$5.2M+', label: 'Raised' },
              { value: '98%', label: 'Success Rate' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                <p className="mt-2 text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;