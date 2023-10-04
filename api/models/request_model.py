#  Copyright (c) University College London Hospitals NHS Foundation Trust
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

from typing import Optional, Dict
from datetime import datetime
from pydantic import Field
from enum import Enum
from models.data_access_base_model import DataAccessBaseModel

from models.user_model import UserModel

class RequestStatus(str, Enum):
  Pending = "Pending"
  Draft = "Draft"
  InReview = "InReview"
  Rejected = "Rejected"
  Approved = "Approved"
  Completed = "Completed"

# TODO: Add more fields
 
class RequestModel(DataAccessBaseModel):
    id: Optional[str] = Field(default="",title="Id", description="Unique ID for the request")
    projectId: str =Field (title="Project ID", description="ID for the project")
    description: str = Field(title="Description", description="Short summary of the request")
    status: Optional[RequestStatus] = Field(default=None, title="Status", description="Status of the request")
    title: str = Field(title="Title", description="Title for the request")
    projectName: str = Field(title="Project Name", description="Project Name for the request")
    requestor: Optional[UserModel] = Field(default=None, title="Requestor", description="Details of requestor")
    requestedWhen: Optional[datetime] = Field(default=None, title="Requested When", description="Date time of request")
    workspaceId: str = Field(title="Workspace Id", description="TRE workspace ID for the request")
    updates: Optional[list] = Field(default=None, title="Updates", description="List capturing the diff made to the overall object")
    dataset: Optional[str] = Field(default="", title="Dataset", description="Dataset")
    cohortSelectionQuery: Optional[str] = Field(default="", title="Cohort Selection Query", description="Cohort Selection Query")
    requestData: Optional[Dict[str, str]] = Field(default=None, title="Request Date", description="Flexible property dictionary to store any custom request data")

class UpdateModel(DataAccessBaseModel):
    status: RequestStatus = Field(default=None, title="Status", description="Status of the request")
    comment: str = Field(default=None, title="Messages", description="Comments provided by Reviewer")
   