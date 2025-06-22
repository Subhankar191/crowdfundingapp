import { useEthereum } from '../../context/EthereumContext';
import { formatAddress } from '../../utils/helpers';

const ConnectWallet = () => {
  const { address, connectWallet, disconnectWallet, balance } = useEthereum();

  return (
    <div className="flex items-center space-x-4">
      {address ? (
        <div className="flex items-center space-x-2">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            {formatAddress(address)}
          </span>
          {balance && (
            <span className="text-sm font-medium">
              {parseFloat(balance).toFixed(4)} ETH
            </span>
          )}
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;