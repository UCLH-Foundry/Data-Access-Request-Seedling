import React from 'react';
import { Stack, IStackTokens, useTheme } from '@fluentui/react';
import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';

const Header: React.FC = () => {
  const stackTokens: IStackTokens = { childrenGap: 20 };
  const theme = useTheme();

  return (
    <Stack horizontal tokens={stackTokens} horizontalAlign="end" styles={{ root: { padding: 20, backgroundColor: theme.palette.themePrimary, color: theme.palette.white } }}>
      <Stack.Item grow={100}>
        <Link to='/' style={{ color: theme.palette.white, textDecoration: 'none', padding:0, margin:0, display: 'inline-block' }}>
          LOGO
        </Link>
      </Stack.Item>
      <Stack.Item grow={1}>
        <UserMenu />
      </Stack.Item>
    </Stack>
  );
};

export default Header;
