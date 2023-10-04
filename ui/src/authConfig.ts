import { Configuration,  PublicClientApplication } from "@azure/msal-browser";
import config from "./config.json"

// MSAL configuration
const configuration: Configuration = {
    auth: {
      clientId: config.aadClientId,
      authority: `https://login.microsoftonline.com/${config.aadTenantId}`,
      redirectUri: window.location.href,
      postLogoutRedirectUri: `${window.location.protocol}//${window.location.hostname}:${window.location.port}/logout`
    }
  };
  
export const pca = new PublicClientApplication(configuration);
