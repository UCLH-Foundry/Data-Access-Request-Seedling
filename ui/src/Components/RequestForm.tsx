import React, { useState, useEffect } from 'react';
import { Stack, TextField, Text, PrimaryButton, Dropdown, MessageBar, MessageBarType, DefaultButton, Label } from '@fluentui/react';
import { useParams } from 'react-router-dom';
import { HttpMethod, ResultType, useAuthApiCall } from '../Hooks/useAuthApiCall';
import { RequestModel, RequestStatus } from '../Models/Request';
import { SecuredByRole } from './SecuredByRole';
import { RoleName } from '../Models/roles';

interface IRequestFormProps {
  onSubmit: (formData: RequestModel) => void;
}

const RequestForm: React.FC<IRequestFormProps> = ({ onSubmit }) => {
  const { requestId } = useParams();
  const [request, setRequest] = useState<RequestModel>({ status: RequestStatus.Draft, dataset: 'RIO' } as RequestModel);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Store error message
  const [comments, setComments] = useState<string>(''); // this is for storing the comments for the data manager
  const [sending, setSending] = useState(false);

  const callApi = useAuthApiCall();

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const response = await callApi(`/request/${requestId}`, HttpMethod.Get);
        setRequest(response);

      } catch (error) {
        console.error('Error loading request data', error);
      }
    };

    if (requestId) fetchRequestData();

  }, [requestId, callApi]);

  const validateForm = () => {
    const requiredFields = ['projectId', 'projectName', 'title', 'description', 'workspaceId', 'dataset', 'cohortSelectionQuery'];
    const isValid = requiredFields.every(field => !!request[field as keyof RequestModel]);
    setIsFormValid(isValid);
  };
  
  useEffect(() => {
    //this is for validating the form whenever request or comments change
    validateForm();
  }, [request]);

  const handleRequestDetailsChange = (
    field: keyof RequestModel,
    value: string
  ) => {
    if (request.status === RequestStatus.Draft) {

      setRequest({
        ...request,
        [field]: value,
      });
    }
  };

  const handleUpdateStatus = async (status: RequestStatus) => {
    setSending(true);
    try {
      // Implement logic to send the update request to the backend
      const response = await callApi(`/request/${requestId}/status`, HttpMethod.Post, { status: status, comment: comments }, ResultType.JSON);

      // After the request is updated, update the mode and show a success message
      setErrorMessage(null);

      setRequest({ ...request, status });
      setSending(false);

      // call parent onSubmit method
      onSubmit(response);
    } catch (error) {
      console.error(` Error updating request status (${status})`, error);
      setErrorMessage(`An error occurred while updating the request status (${status}). Please try again.`);
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    // Implement logic to send approval request to the backend
    // You may use the callApi function to make the API call
    // After the request is approved, update the mode and show a success message

    setSending(true);
    try {
      let response = {} as RequestModel
      request.requestor = null
      if (requestId) {
        // it's an update
        response = await callApi(`/request/${requestId}`, HttpMethod.Put, request, ResultType.JSON);
      } else {
        // it's a create
        response = await callApi(`request`, HttpMethod.Post, request, ResultType.JSON);
      }

      // Clear the form data after submission.
      setRequest({} as RequestModel);
      setErrorMessage(null);

      // call parent onSubmit
      onSubmit(response);

    } catch (err: any) {
      setErrorMessage(`${err.message} - Please see console for details`);
    }

    setSending(false);
  };

  return (
    <Stack tokens={{ childrenGap: 40 }}>

      {errorMessage && (
        <MessageBar messageBarType={MessageBarType.error}>
          {errorMessage}
        </MessageBar>
      )}

      <div>
        <h2>Project Details</h2>
       <Stack tokens={{ childrenGap: 10 }}>
       <div>
       <Label>Project ID</Label>
      {request.status === RequestStatus.Draft ? (
         <TextField
          value={request.projectId}
          onBlur={validateForm}
          onChange={(_, value) => handleRequestDetailsChange('projectId', value || '')}
        />
        ) : ( 
        <Text>{request.projectId}</Text>
        )}
       </div>

        <div>
      <Label>Project Name</Label>
      {request.status === RequestStatus.Draft ? (
        <TextField
          value={request.projectName}
          onBlur={validateForm}
          onChange={(_, value) => handleRequestDetailsChange('projectName', value || '')}  
        />
        ) : (
          <Text>{request.projectName}</Text>
        )}
      </div>

    </Stack>
      </div>
      <div>
        <h2>Data Access Details</h2>
        <Stack tokens={{ childrenGap: 10 }}>
        <div>
        <Label>Data Request Title</Label>
        {request.status === RequestStatus.Draft ? (
        <TextField
          value={request.title}
          onBlur={validateForm}
          onChange={(_, value) => handleRequestDetailsChange('title', value || '')} 
        />
        ) : (
          <Text>{request.title}</Text>
        )}
       </div>
      <div>
        <Label>Description/Justification</Label>
        {request.status === RequestStatus.Draft ? (
        <TextField
          multiline
          rows={4}
          value={request.description}
          onBlur={validateForm}
          onChange={(_, value) => handleRequestDetailsChange('description', value || '')} 
        />
        ) : (
          <Text>{request.description}</Text>
        )}
       </div>
      <div>
       <Label>TRE Workspace ID</Label>
        {request.status === RequestStatus.Draft ? (
        <TextField
          value={request.workspaceId}
          onBlur={validateForm}
          onChange={(_, value) => handleRequestDetailsChange('workspaceId', value || '')}
        />
        ) : (
          <Text>{request.workspaceId}</Text>
        )}
       </div>
      <div>
       <Label>Dataset</Label>
        {request.status === RequestStatus.Draft ? (
        <Dropdown
          selectedKey={request.dataset}
          options={[
            { key: 'RIO', text: 'RIO' }, // this sets dataset name and value to 'RIO'
          ]}
          onBlur={validateForm}
          onChange={(_, option) => handleRequestDetailsChange('dataset', option?.key as string)}
        />
        ) : (
          <Text>{request.dataset}</Text>
        )}
       </div>
      <div>
       <Label>Cohort Selection Query</Label>
        {request.status === RequestStatus.Draft ? (
        <TextField
          multiline
          rows={4}
          value={request.cohortSelectionQuery}
          onBlur={validateForm}
          onChange={(_, value) => handleRequestDetailsChange('cohortSelectionQuery', value || '')}
        />
        ) : (
          <Text>{request.cohortSelectionQuery}</Text>
        )}
       </div>
       </Stack> 
     </div>

      <SecuredByRole allowedRoles={[RoleName.Researcher]} element={
        <div style={{ textAlign: 'right' }}>
          <PrimaryButton text="Submit" iconProps={{ iconName: "Send" }} onClick={handleSubmit} disabled={!isFormValid || request.status !== RequestStatus.Draft || sending} />
        </div>
      } />

      <SecuredByRole
        allowedRoles={[RoleName.DataManager]}
        element={
          request.status !== RequestStatus.Draft ? (
          <div>
            <hr />
            <h3>Data Manager Comments</h3>
            <TextField multiline={true} rows={5} label="Comments" value={comments} onChange={(_, value) => setComments(value || '')} />
            <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: 20 }} style={{ marginTop: 20 }}>
              <DefaultButton iconProps={{ iconName: "StatusCircleBlock" }} text="Reject" onClick={() => handleUpdateStatus(RequestStatus.Rejected)} disabled={sending} />
              <DefaultButton iconProps={{ iconName: "Reply" }} text="Send Back to Requestor" onClick={() => handleUpdateStatus(RequestStatus.Draft)} disabled={sending} />
              <PrimaryButton iconProps={{ iconName: "CheckMark" }} text="Approve" onClick={() => handleUpdateStatus(RequestStatus.Approved)} disabled={sending} />
            </Stack>
          </div>
       ) : (
        <> {/* Empty fragment */}
        </>
       )
     }
   />

    </Stack>
  );
};

export default RequestForm;
