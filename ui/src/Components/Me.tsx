import React, { useContext, useEffect } from 'react';
import { Text } from '@fluentui/react';
import { useAccount, useMsal } from '@azure/msal-react';
import { AppRolesContext } from '../Contexts/appRolesContext';
import { HttpMethod, ResultType, useAuthApiCall } from '../Hooks/useAuthApiCall';

const Header: React.FC = () => {
  const roles = useContext(AppRolesContext);
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const apiCall = useAuthApiCall();

  useEffect(() => {
    const getApiMe = async () => {
      const m = await apiCall("me", HttpMethod.Get, null, ResultType.JSON);
      console.log("API /me response: ", m);
    };

    getApiMe();
  }, [apiCall])

  return (
    <>
      <Text variant="xxLarge">{account?.name}</Text>
      <hr />
      <Text variant='large'>Roles: {roles.roles.join(', ')}</Text>
      <hr />
      <p>The API has also been queried for your details, and they are logged in the browser console.</p>
    </>
  );
};

export default Header;
