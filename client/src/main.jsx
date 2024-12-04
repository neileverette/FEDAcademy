import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './config/routes';
import { AppDataProvider } from './components/AppData';
import { AppConfigProvider } from './components/AppConfig';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppConfigProvider>
      <AppDataProvider>
        <RouterProvider router={router} />
      </AppDataProvider>
    </AppConfigProvider>
  </StrictMode>,
);
