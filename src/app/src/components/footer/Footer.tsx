import React from 'react';
import './Footer.css';
import translations from '../constants/en.global.json';

export function Footer() {
  const t = translations.footer;
  return (
    <div className="footer-wrapper">
      <a
        href="https://www.calimero.network"
        className="footer-text"
        target="_blank"
        rel="noreferrer"
      >
        {t.title}
      </a>
    </div>
  );
}
