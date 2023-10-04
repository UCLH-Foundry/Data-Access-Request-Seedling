import { User } from './User'; 
export enum RequestStatus {
  Pending = "Pending",
  Draft = 'Draft',
  Completed = "Completed",
  Approved = "Approved",
  Rejected = "Rejected"
}

export interface UpdateModel { 
  updatedBy: User,
  updatedWhen: string,
  updatedFields: Array<any>,
  comment: string
}

export interface RequestModel {
  id: string; // Change from number to string to match the Python model
  projectId: string
  title: string;
  status: RequestStatus | null; // Use the enum RequestStatus for status
  description: string; // Add description to match the Python model
  projectName: string;
  requestor: User | null; 
  requestedWhen: string | null; // Change from datetime to string to match the Python model
  workspaceId: string;
  messages: string[] | null; // Change from list to string[] to match the Python model
  updates: string[] | null; // Change from list to string[] to match the Python model
  dataset: string
  cohortSelectionQuery: string
  requestData: any | null; // 
}
