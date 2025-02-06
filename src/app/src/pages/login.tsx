// import React from 'react';
import { ClientLogin } from '@calimero-is-near/calimero-p2p-sdk';
import { useNavigate } from 'react-router-dom';
import { clearAppEndpoint, clearApplicationId } from '../utils/storage';
import { getNodeUrl, getStorageApplicationId } from '../utils/node';
import ContentWrapper from '../components/login/ContentWrapper';

// Import the CSS file
import '../styles/Authenticate.css';

export default function Authenticate() {
  const navigate = useNavigate();

  function onSetupClick() {
    clearAppEndpoint();
    clearApplicationId();
    navigate('/');
  }

  return (
    <ContentWrapper>
      <div className="wrapper">
        <div className="flex-wrapper">
          <div className="card">
            <div className="title-wrapper">
              <div className="title">App template</div>
            </div>
            <ClientLogin
              getNodeUrl={getNodeUrl}
              getApplicationId={getStorageApplicationId}
              sucessRedirect={() => navigate('/home')}
            />
          </div>
          <div className="back-button" onClick={onSetupClick}>
            Return to setup
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}
