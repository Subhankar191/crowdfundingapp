import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EthereumProvider } from './context/EthereumContext';
import { useEthereum } from './context/EthereumContext';
import { CampaignProvider } from './context/CampaignContext';
import Loader from './components/common/Loader';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import CreateCampaign from './pages/CreateCampaign';
import Dashboard from './pages/Dashboard';
import Notification from './components/common/Notification';

// Root App that wraps everything in EthereumProvider
function App() {
  return (
    <EthereumProvider>
      <AppWithEthereum />
    </EthereumProvider>
  );
}

// Inner App that uses useEthereum (must be inside EthereumProvider)
function AppWithEthereum() {
  const { isLoading } = useEthereum();

  if (isLoading) return <Loader />;

  return (
    <CampaignProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Notification />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/create" element={<CreateCampaign />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CampaignProvider>
  );
}

export default App;
