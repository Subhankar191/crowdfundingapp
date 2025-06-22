import { Link } from 'react-router-dom';
import { useEthereum } from '../../context/EthereumContext';
import ConnectWallet from './ConnectWallet';

const Navbar = () => {
  const { address, isLoading } = useEthereum();

  // Don't render nav links until we know wallet state
  if (isLoading) return <nav className="bg-gradient-to-r from-indigo-900 to-purple-800 h-16" />;

  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-purple-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left-side links */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-bold text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
            >
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 text-transparent bg-clip-text">
                FundFlow
              </span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-6">
              <Link 
                to="/campaigns" 
                className="relative text-indigo-100 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200 group"
              >
                Campaigns
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* Show dashboard to all connected users */}
              {address && (
                <Link 
                  to="/dashboard" 
                  className="relative text-indigo-100 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200 group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}
            </div>
          </div>

          {/* Wallet connection button */}
          <div className="flex items-center">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;