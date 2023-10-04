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

import uuid
from services.data_factory import trigger_pipeline
from models.message_model import MessageModel
from models.user_model import UserModel
from models.request_model import RequestModel, RequestStatus, UpdateModel
from services.cosmos_client import cosmos_client
from datetime import datetime
from models.auth_model import RoleName
from fastapi_azure_auth.exceptions import InvalidAuth
import os

db_client = cosmos_client()
url = os.environ.get("DATA_PROVISIONING_URL", default="")
user_fields = ["projectId", "projectName", "description", "title", "workspaceId", "dataset", "cohortSelectionQuery"]


# create new request
def create_request(request: RequestModel, user: UserModel):    
    # create a blank 'previous' request for comparison
    existing_request = RequestModel(
        id = str(uuid.uuid4()),
        status=RequestStatus.Pending,
        projectId="",
        projectName="",
        description="",
        title="",
        workspaceId="",
        dataset="",
        cohortSelectionQuery="",
        updates=[]
    )

    existing_request.requestor = user.__dict__
    existing_request.requestedWhen = get_datetime_now()

    # create the update entry
    request = create_update_dict(user=user, existing_request=existing_request.__dict__, new_request=request)
    item = db_client.create_item(request)
    return item


# return single request by id
def get_single_request(request_id, user: UserModel):
    item = db_client.read_item(item=request_id, partition_key=request_id)
    if RoleName.DataManager not in user.roles and item['requestor'] != user.__dict__:
        raise InvalidAuth(
            'User is not a DataManager nor original Requestor of this request')

    return item


# return all requests
def get_all_requests(user: UserModel):
    items = []
    for item in db_client.query_items(
            query=f"SELECT * FROM c ORDER BY c._ts DESC",
            enable_cross_partition_query=True):
        items.append(item)
    return items


# return all requests by a status
def get_requests_by_status(user: UserModel, status: RequestModel):
    items = []
    for item in db_client.query_items(
            query=f"SELECT * FROM c WHERE c.status = '{status}' ORDER BY c._ts DESC",
            enable_cross_partition_query=True):
        items.append(item)
    return items

# return all requests by user's aad object id
def get_my_requests(user: UserModel):
    items = []
    for item in db_client.query_items(
            query=f"SELECT * FROM c WHERE c.requestor.aad_object_id = '{user.aad_object_id}' ORDER BY c._ts DESC",
            enable_cross_partition_query=True):
        items.append(item)
    return items


# update status, message and include datetime and data manager details on existing request
# trigger data provisioning pipeline if status is Approved
def update_status(request_id, request: UpdateModel, user: UserModel):
    existing_request = db_client.read_item(item=request_id, partition_key=request_id)

    existing_request = create_update_dict(
        existing_request=existing_request,
        new_request=request,
        user=user,
        comment=request.comment,
        include_status=True)

   

    # trigger data provisioning pipeline if status is Approved
    if request.status == RequestStatus.Approved:
        try:
            link_to_run = trigger_pipeline(existing_request)
            existing_request['updates'].append({
                "updatedBy": {
                    "aad_object_id": "system",
                    "name": "System",
                    "roles": [],
                    "preferred_username": "System",
                    "issuer": ""
                },
                "updatedWhen": get_datetime_now(),
                "comment": f'Data provisioning pipeline triggered. See the run here: {link_to_run}' 
            })
            
        except Exception as e:
            raise Exception('Failed to trigger data provisioning pipeline', e)
    
    item = db_client.upsert_item(body=existing_request)
    return item


# add arbitrary message to request
def add_message(request_id: str, message_model: MessageModel, user: UserModel):
    existing_request = db_client.read_item(item=request_id, partition_key=request_id)
    existing_request = create_update_dict(user=user, existing_request=existing_request, comment=message_model.comment)
    db_client.upsert_item(body=existing_request)

    # return the last message
    return existing_request['updates'][-1]


# return all updates for a request
def get_updates(request_id: str):
    existing_request = db_client.read_item(
        item=request_id, partition_key=request_id)
    return existing_request['updates']


# update details on existing request
def update_request(request_id, request: RequestModel, user: UserModel):
    existing_request = db_client.read_item(
        item=request_id, partition_key=request_id)

    # only the requestor can update the details
    if existing_request['requestor'] != user.__dict__:
        raise InvalidAuth(
            'Cannot submit: User is not original Requestor of this request')

    # create the update entry
    existing_request = create_update_dict(
        user=user, existing_request=existing_request, new_request=request)
    existing_request['status'] = RequestStatus.Pending
    item = db_client.upsert_item(body=existing_request)

    return item


# create a diff object to store the differences between the existing request and the new request
def create_update_dict(user: UserModel, existing_request: RequestModel = None, new_request: RequestModel = None, comment: str = None, include_status: bool = False) -> dict:

    update_dict = {
        "updatedBy": user.__dict__,
        "updatedWhen": get_datetime_now(),
        "updatedFields": {}
    }

    if existing_request and new_request:
        for field in user_fields:
            if field in new_request.__dict__ and existing_request[field] != new_request.__dict__[field]:
                update_dict['updatedFields'][field] = {}
                update_dict['updatedFields'][field]['from'] = existing_request[field]
                update_dict['updatedFields'][field]['to'] = new_request.__dict__[field]
                existing_request[field] = new_request.__dict__[field]

    if include_status:
        update_dict['updatedFields']['status'] = {}
        update_dict['updatedFields']['status']['from'] = existing_request['status']
        update_dict['updatedFields']['status']['to'] = new_request.status
        existing_request['status'] = new_request.status

    if comment:
        update_dict['comment'] = comment

    if existing_request:
        existing_request['updates'].append(update_dict)

    return existing_request


def get_datetime_now() -> str:
    # return unix timestamp
    return datetime.timestamp(datetime.utcnow())
