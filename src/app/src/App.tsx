

import IndexPage from "@/pages/index";
import EnterLotteryPage from "@/pages/enter";
import CreateLotteryPage from "@/pages/createlottery";
import BuyTicketsPage from "@/pages/buytickets";
import DemoPage from "@/pages/demo";
import LoginPage from "@/pages/login";
import SetupPage from "@/pages/setup";
import { AccessTokenWrapper } from '@calimero-is-near/calimero-p2p-sdk';
import { Routes, Route } from 'react-router-dom';
import { getNodeUrl } from './utils/node';

function App() {
  return (
    
    <AccessTokenWrapper getNodeUrl={getNodeUrl}>
   
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/home" element={<IndexPage />} />
        <Route path="/enterlottery" element={<EnterLotteryPage />} />
        <Route path="/buytickets" element={<BuyTicketsPage />} />
        <Route path="/createlottery" element={<CreateLotteryPage />} />
        <Route path="/propose" element={<DemoPage />} />
      </Routes>
   
  </AccessTokenWrapper> 
  );
}

export default App;

