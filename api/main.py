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

import os
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from models.message_model import MessageModel
from models.user_model import UserModel
from services.auth import validate_is_data_manager_user, validate_is_in_any_app_role

from services.requests import add_message, create_request, get_all_requests, get_requests_by_status, get_single_request, get_my_requests, get_updates, update_status, update_request
from models.request_model import RequestModel, UpdateModel, RequestStatus

# create the FastAPI app
app = FastAPI()

# TODO: Set up logging

# figure out where we're running
environment = os.environ.get("ENVIRONMENT", default="dev")

# add CORS when running locally as we use 2 different ports. 
# when in hosting, the UI and API are served from the same origin
if environment == 'dev':
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"])

# API Endpoints
@app.get("/api/me", )
def hello(user: UserModel = Depends(validate_is_in_any_app_role)):
    return user

# creates new request
@app.post("/api/request")
def post_request(request: RequestModel, user: UserModel = Depends(validate_is_in_any_app_role)):
    return create_request(request, user)

# updates other request details provided by reseacher/requestor
@app.put("/api/request/{request_id}")
def update_request_details(request_id, request: RequestModel, user: UserModel = Depends(validate_is_in_any_app_role)):
    return update_request(request_id, request, user)

# add message
@app.post("/api/request/{request_id}/message")
def add_user_message(request_id, message_model: MessageModel, user: UserModel = Depends(validate_is_in_any_app_role)):
    return add_message(request_id, message_model, user)

# get messages
@app.get("/api/request/{request_id}/message")
def get_all_updates(request_id, user: UserModel = Depends(validate_is_in_any_app_role)):
    return get_updates(request_id)

# returns all requests
@app.get("/api/request")
def get_requests(user: UserModel = Depends(validate_is_data_manager_user)):
    return get_all_requests(user)

# returns all requests submitted by user's aad object id
@app.get("/api/request/my")
def get_user_requests(user: UserModel = Depends(validate_is_in_any_app_role)):
    return get_my_requests(user)

# returns all requests with a status of pending
@app.get("/api/request/pending")
def get_pending_requests(user: UserModel = Depends(validate_is_data_manager_user)):
    return get_requests_by_status(user, RequestStatus.Pending)

# returns single request by request id
@app.get("/api/request/{request_id}")
def get_request(request_id, user: UserModel = Depends(validate_is_in_any_app_role)):
    return get_single_request(request_id, user)

# updates request status and comment provided by data manager
@app.post("/api/request/{request_id}/status")
def update_request_status(request_id, request: UpdateModel, user: UserModel = Depends(validate_is_data_manager_user)):
    return update_status(request_id, request, user)


if environment != 'dev':
    # UI Hosting
    templates = Jinja2Templates(directory="../ui/build")
    app.mount("/static", StaticFiles(directory="../ui/build/static", html = True), name="Data Access Request")

    @app.route("/{full_path:path}")
    async def catch_all(request: Request):
        return templates.TemplateResponse("index.html", {"request": request})
