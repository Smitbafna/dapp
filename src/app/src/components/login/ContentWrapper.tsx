import React from 'react';
import './ContentWrapper.css';
import { Footer } from '../footer/Footer';
import CalimeroLogo from '../assets/calimero-logo.svg';

export default function ContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wrapper">
      <div className="login-navbar">
        <div className="logo-container">
          <img
            src={CalimeroLogo as unknown as string}
            alt="Calimero Admin Dashboard Logo"
            className="calimero-logo"
          />
          <h4 className="dashboard-text">Calimero Network</h4>
        </div>
      </div>
      <div className="content-card">
        <div className="content-wrapper">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
