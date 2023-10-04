import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import reportWebVitals from "./reportWebVitals";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { pca } from './authConfig'
import { InteractionType } from '@azure/msal-browser';
import App from './App';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { MessageBar, MessageBarType, ThemeProvider } from '@fluentui/react';
import { GenericErrorBoundary } from './Components/GenericErrorBoundary';
import { appTheme } from './appTheme';
import './App.css';

initializeIcons();

// AAD Auth - MSAL
function LoadingComponent() {
  return <MessageBar
    messageBarType={MessageBarType.info}
    isMultiline={true}
  >
    <h2>Authenticating with Azure AD...</h2>
  </MessageBar>;
}

const root = createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={appTheme}>
        <GenericErrorBoundary>
          <Routes>
            <Route path="*" element={
              <MsalProvider instance={pca}>
                <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} loadingComponent={LoadingComponent}>
                  <App />
                </MsalAuthenticationTemplate>
              </MsalProvider>} />
            <Route path='/logout' element={<div className='da-logout-message'>
              <MessageBar
                messageBarType={MessageBarType.success}
                isMultiline={true}
              >
                <h2>You are logged out.</h2>
                <p>It's a good idea to close your browser windows.</p>
              </MessageBar>
            </div>} />
          </Routes>
        </GenericErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals(console.log);
