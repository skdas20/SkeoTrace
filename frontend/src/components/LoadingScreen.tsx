import React from 'react';
import { Leaf } from 'lucide-react';
import './LoadingScreen.css';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-wrap">
      <div className="loading-stack">
        <div className="loading-brand">
          {/* Leaf logo matching the nav */}
          <Leaf className="loading-logo" />

          {/* Main wordmark with reveal */}
          <div className="loading-wordmark">
            <span className="loading-reveal">SKEOTRACE</span>
          </div>
        </div>

        {/* Caption pill */}
        <div className="loading-caption">Transparent farm-to-fork</div>
      </div>

      {/* Bottom-right loading bars */}
      <div className="loading-eq" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
      </div>
    </div>
  );
};
