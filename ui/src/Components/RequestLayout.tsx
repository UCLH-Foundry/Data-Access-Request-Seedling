import React, { useContext, useState } from 'react';
import { FontWeights, MessageBar, MessageBarType, Panel, PanelType, Pivot, PivotItem, PrimaryButton, Stack, Text } from '@fluentui/react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RequestForm from './RequestForm';
import RequestList from './RequestList';
import { RoleName } from '../Models/roles';
import { AppRolesContext } from '../Contexts/appRolesContext';
import { ToastContext } from '../Contexts/toastContext';
import { RequestModel } from '../Models/Request';
import MessageList from './UpdatesList';

const RequestLayout: React.FC = () => {
  const navigate = useNavigate();
  const appRoles = useContext(AppRolesContext);
  const toastCtx = useContext(ToastContext);
  const [lastCallDateTime, setLastCallDateTime] = useState(Date())

  const formSubmitted = (formData: RequestModel, isUpdate: boolean) => {
    toastCtx.setToastBody(
      <>
        <MessageBar messageBarType={MessageBarType.success} style={{ padding: 10 }}>
          <Text as="h1" block variant="xLarge" style={{ marginBottom: 12, fontWeight: FontWeights.semibold }}>
            Success!
          </Text>
          <Text block >
            {`Data access request ${isUpdate ? 'updated' : 'created'} successfully. You can check back here for progress.`}
          </Text>
        </MessageBar>
      </>
    )
    
    window.setTimeout(() => { navigate('/') } , 0);

    // force the request list components to refresh their data
    setLastCallDateTime(Date());
  }

  return (
    <>
      <Stack tokens={{ childrenGap: 40 }}>
        <Stack.Item>
          <Stack horizontal={true}>
            <Stack.Item grow={1}>
              <Text variant="xxLarge">Data Access Requests</Text>
            </Stack.Item>
            <Stack.Item>
              <PrimaryButton iconProps={{ iconName: 'Add' }} text="Create new" onClick={() => { navigate('./requests/new') }} />
            </Stack.Item>
          </Stack>
        </Stack.Item>

        <Pivot aria-label="Request Menu">
          <PivotItem
            headerText="My Requests"
            headerButtonProps={{
              'data-order': 1,
              'data-title': 'MyRequests',
            }}
          >
            <div style={{ padding: 5 }}>
              <RequestList requestUrl='request/my' lastCallDateTime={lastCallDateTime} />
            </div>
          </PivotItem>
          {
            appRoles.roles.includes(RoleName.DataManager) &&
            <PivotItem
              headerText="Pending Requests"
              headerButtonProps={{
                'data-order': 2,
                'data-title': 'PendingRequests',
              }}
            >
              <div style={{ padding: 5 }}>
                <RequestList requestUrl='request/pending' lastCallDateTime={lastCallDateTime} />
              </div>
            </PivotItem>
          }
          {
            appRoles.roles.includes(RoleName.DataManager) &&
            <PivotItem
              headerText="All Requests"
              headerButtonProps={{
                'data-order': 3,
                'data-title': 'AllRequests',
              }}
            >
              <div style={{ padding: 5 }}>
                <RequestList requestUrl='request' lastCallDateTime={lastCallDateTime} />
              </div>
            </PivotItem>
          }
        </Pivot>
      </Stack >
      <Routes>
        <Route path="requests/new" element={
          <Panel
            headerText="New Data Access Request"
            isOpen={true}
            isLightDismiss={true}
            onDismiss={() => { navigate('/') }}
            isFooterAtBottom={true}
            closeButtonAriaLabel="Close"
            type={PanelType.custom}
            customWidth="650px"
          >
            <RequestForm onSubmit={(formData: RequestModel) => formSubmitted(formData, false)} />
          </Panel>
        } />
        <Route path="requests/:requestId" element={
          <Panel
            headerText="Review Data Access Request"
            isOpen={true}
            isLightDismiss={true}
            onDismiss={() => { navigate('/') }}
            isFooterAtBottom={true}
            closeButtonAriaLabel="Close"
            type={PanelType.custom}
            customWidth="650px"
          >
            <Pivot aria-label="Request Menu">
              <PivotItem
                headerText="Request"
                headerButtonProps={{
                  'data-order': 1,
                  'data-title': 'Request',
                }}
              >
                <RequestForm onSubmit={(formData: RequestModel) => formSubmitted(formData, true)} />
              </PivotItem>
              <PivotItem headerText="Updates"
                headerButtonProps={{
                  'data-order': 1,
                  'data-title': 'Updates',
                }}
              >
                <MessageList lastCallDateTime={lastCallDateTime} />
              </PivotItem>
            </Pivot>
          </Panel>
        } />
      </Routes>
    </>
  );
};

export default RequestLayout;

