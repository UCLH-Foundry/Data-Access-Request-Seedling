import React from 'react';
import { Stack, IStackTokens, useTheme } from '@fluentui/react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const stackTokens: IStackTokens = { childrenGap: 20 };
  const theme = useTheme();

  return (
    <Stack horizontal tokens={stackTokens} verticalAlign="center" horizontalAlign="center" styles={{ root: { padding: 20,backgroundColor: theme.palette.themePrimary, color: theme.palette.white, textAlign: 'center' } }}>
      <Link to="/privacy" style={{color: theme.palette.white, textDecoration: 'none', paddingRight: 20}}>Privacy Policy</Link>|
      <Link to="/terms" style={{color: theme.palette.white, textDecoration: 'none', paddingRight: 20}}>Terms of Use</Link>|
      <Link to="/contact" style={{color: theme.palette.white, textDecoration: 'none', paddingRight: 20}}>Contact Us for Support</Link>
    </Stack>
  );
};

export default Footer;
