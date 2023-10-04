import React, { useState, useEffect } from 'react';
import { IColumn, Icon, MessageBar, MessageBarType, Persona, PersonaSize, SelectionMode, ShimmeredDetailsList, Stack } from '@fluentui/react';
import { RequestModel, RequestStatus } from '../Models/Request'
import { HttpMethod, ResultType, useAuthApiCall } from '../Hooks/useAuthApiCall';
import { useNavigate } from 'react-router-dom';

interface RequestListProps {
  requestUrl: string
  lastCallDateTime?: string
}

const RequestList: React.FC<RequestListProps> = (props: RequestListProps) => {
  const [requests, setRequests] = useState<Array<RequestModel>>([] as Array<RequestModel>);
  const [loading, setLoading] = useState(true);
  const apiCall = useAuthApiCall();
  const navigate = useNavigate();

  const columns: IColumn[] = [
    { key: 'title', name: 'Title', fieldName: 'title', minWidth: 50, maxWidth: 150 },
    { key: 'description', name: 'Description', fieldName: 'description', minWidth: 100, maxWidth: 300, isMultiline: true },
    { key: 'requestor', name: 'Requestor', minWidth: 50, maxWidth: 250, onRender: (request: RequestModel) => <Persona size={PersonaSize.size24} text={request.requestor?.name} /> },
    {
      key: 'status', name: 'Status', fieldName: 'status', minWidth: 50, maxWidth: 120, onRender: (request: RequestModel) => <div style={{paddingLeft: 10}}>
        {request.status === RequestStatus.Pending && <Icon iconName="Clock" style={{ fontSize: 16 }} title="Pending" />}
        {request.status === RequestStatus.Approved && <Icon iconName="CheckMark" style={{ fontSize: 16, fontWeight: 'bold', color: '#009900' }} title="Approved" />}
        {request.status === RequestStatus.Rejected && <Icon iconName="StatusCircleBlock" style={{ fontSize: 16, color: '#990000', fontWeight: 'bold' }} title="Rejected" />}
        {request.status === RequestStatus.Draft && <Icon iconName="Edit" style={{ fontSize: 16 }} title="Draft" />}
      </div>
    },
    { key: 'actions', name: 'Review', minWidth: 50, maxWidth: 50, onRender: (request: RequestModel) => <div style={{ textAlign: 'center' }}><Icon iconName="View" style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => navigate(`./requests/${request.id}`)} /></div> },
  ];

  useEffect(() => {
    setLoading(true);
    const callApi = async () => {
      let r = await apiCall(props.requestUrl, HttpMethod.Get, null, ResultType.JSON);
      setRequests(r);
      setLoading(false);
    }

    callApi();
  }, [apiCall, props.requestUrl, props.lastCallDateTime])

  return (
    <Stack tokens={{ childrenGap: 40 }}>

      <ShimmeredDetailsList
        items={requests.map((request) => ({
          ...request,
          key: request.id.toString(),
        }))}
        columns={columns}
        enableShimmer={loading}
        selectionMode={SelectionMode.none}
      />

      {
        !loading && requests.length === 0 &&
        <MessageBar messageBarType={MessageBarType.info}>
          No requests to show here yet. Click "Create new" to get started.
        </MessageBar>
      }

    </Stack>
  );
};

export default RequestList;
