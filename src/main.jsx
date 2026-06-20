import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from "react-router"
import { Provider } from 'react-redux';
import { store } from './stores/store.js';
import ThemeProvider from './theme/ThemeProvider.jsx';

createRoot(document.getElementById('root')).render(
  // Refresh From here & all state varibale gets removed.
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
