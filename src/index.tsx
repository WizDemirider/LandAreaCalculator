// filepath: /home/wizdem/AI/LandAreaCalculator/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import LandAreaCalculator from './land-area-calculator.tsx';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <LandAreaCalculator />
  </React.StrictMode>
);