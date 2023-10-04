import { AuthenticationResult, InteractionRequiredAuthError } from "@azure/msal-browser";
import { useMsal, useAccount } from "@azure/msal-react";
import { useCallback } from "react";
import config from "../config.json";
import { APIError } from "../Models/apiException"

export enum ResultType {
  JSON = "JSON",
  Text = "Text",
  None = "None"
}

export enum HttpMethod {
  Get = "GET",
  Put = "PUT",
  Post = "POST",
  Patch = "PATCH",
  Delete = "DELETE"
}

export const useAuthApiCall = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  // parse the token to get the roles
  const parseJwt = (token: string) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  return useCallback(async (
    endpoint: string,
    method: HttpMethod,
    body?: any,
    resultType?: ResultType,
    setRoles?: (roles: Array<string>) => void,
    tokenOnly?: boolean) => {

    config.debug && console.log("API call", {
      endpoint: endpoint,
      method: method,
      body: body,
      resultType: resultType,
      tokenOnly: tokenOnly
    });

    if (!account) {
      console.error("No account object found, please refresh.");
      return;
    }

    let tokenResponse = {} as AuthenticationResult;
    let tokenRequest = {
      scopes: [`${config.aadIdentifierUri}/user_impersonation`, 'offline_access'],
      account: account
    }

    // try and get a token silently. at times this might throw an InteractionRequiredAuthError - if so give the user a popup to click
    try {
      tokenResponse = await instance.acquireTokenSilent(tokenRequest);

      // check for expiry and pop up if needed
      let isExpired = tokenResponse.expiresOn && new Date().getTime() >= tokenResponse.expiresOn.getTime();
      console.log("token", tokenResponse.expiresOn, "now", Date())
      if(isExpired) {
        console.warn("AAD Token expired, getting a new one...")
        tokenResponse = await instance.acquireTokenPopup(tokenRequest);
      }
    } catch (err) {
      console.warn("Unable to get a token silently", err);
      if (err instanceof InteractionRequiredAuthError) {
        tokenResponse = await instance.acquireTokenPopup(tokenRequest);
      }
    }

    config.debug && console.log("Token Response", tokenResponse);

    if (!tokenResponse) {
      console.error("Token could not be retrieved, please refresh.");
      return;
    }

    // caller can pass a function to allow us to set the roles to use for RBAC
    if (setRoles) {
      let decodedToken = parseJwt(tokenResponse.idToken);
      config.debug && console.log("Decoded token", decodedToken);
      setRoles(decodedToken.roles);
    }

    // we might just want the token to get the roles.
    if (tokenOnly) return;

    // trim first slash if we're given one
    if (endpoint[0] === "/") endpoint = endpoint.substring(1);

    // default to JSON unless otherwise told
    resultType = resultType || ResultType.JSON;
    config.debug && console.log(`Calling ${method} on authenticated api: ${endpoint}`);

    // set the headers for auth + http method
    const opts: RequestInit = {
      headers: {
        Authorization: `Bearer ${tokenResponse.idToken}`,
        'Content-Type': 'application/json',
      },
      method: method
    }

    // add a body if we're given one
    if (body) opts.body = JSON.stringify(body);

    let resp;
    // set the URL depending on whether we're running locally or in hosting
    const url = process.env.NODE_ENV === 'production' ? `/api/${endpoint}` : `http://localhost:8000/api/${endpoint}`
    try {      
      resp = await fetch(url, opts);
    } catch (err: any) {
      console.error(err);
      let e = err as APIError;
      e.name = 'API call failure';
      e.message = 'Unable to make call to API Backend';
      e.endpoint = url;
      throw e;
    }

    if (!resp.ok) {
      let e = new APIError();
      e.message = await resp.text();
      e.status = resp.status;
      e.endpoint = endpoint;
      throw e;
    }

    try {
      switch (resultType) {
        case ResultType.Text:
          let text = await resp.text();
          config.debug && console.log(text);
          return text;
        case ResultType.JSON:
          let json = await resp.json();
          config.debug && console.log(json);
          return json
        case ResultType.None:
          return;
      }
    } catch (err: any) {
      let e = err as APIError;
      e.name = "Error with response data";
      throw e;
    }

  }, [account, instance]);
}
