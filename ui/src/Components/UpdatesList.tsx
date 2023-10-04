import React, { useState, useEffect } from 'react';
import { Text, MessageBar, MessageBarType, Persona, PersonaSize, PrimaryButton, Stack, TextField, Icon } from '@fluentui/react';
import { HttpMethod, ResultType, useAuthApiCall } from '../Hooks/useAuthApiCall';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { UpdateModel } from '../Models/Request';
import { GenericErrorBoundary } from './GenericErrorBoundary';

interface RequestListProps {
  lastCallDateTime?: string
}

const UpdatesList: React.FC<RequestListProps> = (props: RequestListProps) => {
  const [updates, setUpdates] = useState<Array<UpdateModel>>([] as Array<UpdateModel>);
  const { requestId } = useParams();
  const [loading, setLoading] = useState(true);
  const apiCall = useAuthApiCall();
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    const getUpates = async () => {
      let r = await apiCall(`/request/${requestId}/message`, HttpMethod.Get, null, ResultType.JSON);
      setUpdates(r.reverse());
      setLoading(false);
    }

    getUpates();
  }, [apiCall, props.lastCallDateTime, requestId])

  const addMessage = async () => {
    let r = await apiCall(`/request/${requestId}/message`, HttpMethod.Post, { comment: newMessage }, ResultType.JSON);
    setUpdates([r, ...updates]);
    setNewMessage('');
  }

  return (
    <Stack tokens={{ childrenGap: 20 }} style={{ marginTop: 20 }}>

      <form onSubmit={(e) => { e.preventDefault(); addMessage(); }}>
        <TextField
          id="message"
          label="Add a comment"
          multiline rows={5} resizable={false} value={newMessage}
          onChange={(_, value) => setNewMessage(value || '')} />
        <div style={{ textAlign: 'right' }} >
          <PrimaryButton type="submit" style={{ marginTop: 10 }} iconProps={{ iconName: 'Send' }} disabled={!newMessage || newMessage.length === 0}>Send</PrimaryButton>
        </div>
      </form>

      {
        !loading && updates.length === 0 &&
        <MessageBar messageBarType={MessageBarType.info}>
          No mesages to show here yet.
        </MessageBar>
      }

      {
        !loading && updates.length > 0 && updates.map((update: UpdateModel, i: number) => (
          <div style={{ border: '1px #ccc solid', padding: 10, borderRadius: 2 }}>
            <Persona
              text={update.updatedBy.name}
              size={PersonaSize.size40}
              imageAlt={update.updatedBy.name}
              secondaryText={moment.unix(new Date(update.updatedWhen).getTime()).fromNow()}
            />
            {
              update.comment && update.comment.length > 0 &&
              <Text variant="mediumPlus" style={{ display: 'block', marginTop: 10 }}>
                {update.comment.split(' ').map((word: string, i: number) => {
                  if (word.startsWith('https://')) {
                    return <a href={word} target="_blank" rel="noopener noreferrer" key={i}>{
                        word.indexOf('adf.azure.com') !== -1 ? 'Pipeline Run' : word }
                      </a>
                  } else {
                    return `${word} `
                  }
                })}
              </Text>
            }
            <GenericErrorBoundary>
              {
                update.updatedFields && Object.keys(update.updatedFields).length > 0 &&
                <div style={{ marginTop: 10, border: '1px #ccc solid', backgroundColor: '#f9f9f9', borderRadius: 2, padding: '0 10px' }}>
                  <Text variant="medium" style={{ display: 'block', marginTop: 10 }}>Updated fields:</Text>
                  <ul>
                    {
                      Object.keys(update.updatedFields).map((key: string, i: number) => {
                        return <li key={i}>
                          <strong>{key}</strong>:&nbsp;
                          <span style={{ textDecorationLine: 'line-through' }}>{(update.updatedFields as any)[key]['from']}</span>
                          <Icon iconName='Forward' style={{ margin: '0 5px', fontSize: '10px' }} />
                          {(update.updatedFields as any)[key]['to']}</li>
                      })
                    }
                  </ul>
                </div>
              }
            </GenericErrorBoundary>
          </div>
        ))
      }

    </Stack >
  );
};

export default UpdatesList;
