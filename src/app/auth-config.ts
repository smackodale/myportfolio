import { BrowserCacheLocation, Configuration, LogLevel } from '@azure/msal-browser';
import { environment } from '../environments/environment';

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: environment.clientId, // This is the ONLY mandatory field that you need to supply.
    authority: environment.authority, // Defaults to "https://login.microsoftonline.com/common"
    redirectUri: environment.redirectUri, // Points to window.location.origin. You must register this URI on Azure Portal/App Registration.
    postLogoutRedirectUri: `${environment.redirectUri}/goodbye`, // Indicates the page to navigate after logout.
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel: LogLevel, message: string) {
        console.log(message);
      },
      logLevel: LogLevel.Verbose,
      piiLoggingEnabled: false,
    },
  },
};

export const defaultScope = `${msalConfig.auth.clientId}/.default`;

export const protectedResources = {
  functionApi: {
    endpoint: environment.apiEndpoint,
    scopes: [defaultScope],
  },
};
