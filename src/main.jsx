
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SearchProvider } from './context/SearchContext';
import { InventarioProvider } from './context/InventarioContext';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <InventarioProvider>
          <App />
        </InventarioProvider>
      </SearchProvider>
    </BrowserRouter>
  </React.StrictMode>
);