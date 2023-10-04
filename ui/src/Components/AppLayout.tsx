import React, { useContext } from 'react';
import { Stack, IStackTokens, Callout, DirectionalHint } from '@fluentui/react';
import { ToastContext } from '../Contexts/toastContext';

const stackTokens: IStackTokens = { childrenGap: 10 };

interface AppLayoutProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ header, footer, children }) => {
  const toastCtx = useContext(ToastContext);

  return (
    <>
      <Stack tokens={stackTokens} styles={{ root: { minHeight: '100vh', backgroundColor: '#fefefe' } }}>
        <Stack.Item id="header">{header}</Stack.Item>
        <div style={{ width: '100%', height: 0 }} id="callout-anchor"></div>

        <Stack.Item grow style={{ backgroundColor: '#fff', width: 980, margin: '15px auto 5px auto', border: '0px red solid', padding: 20, boxShadow: '0px 0px 6px 0px #ccc' }}>
          <Stack.Item>{children}</Stack.Item>
        </Stack.Item>
        <Stack.Item>{footer}</Stack.Item>
      </Stack>
      {
        toastCtx.toastBody &&
        <Callout
          role="dialog"
          gapSpace={0}
          target={`#callout-anchor`}
          isBeakVisible={false}
          directionalHint={DirectionalHint.bottomRightEdge}
          shouldDismissOnWindowFocus={true}
          setInitialFocus
          onDismiss={() => toastCtx.setToastBody(undefined)}
        >
          {toastCtx.toastBody}
        </Callout>
      }
    </>
  );
};

export default AppLayout;

