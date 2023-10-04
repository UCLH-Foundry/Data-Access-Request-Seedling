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
from fastapi import Depends
from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from fastapi_azure_auth.user import User
from fastapi_azure_auth.exceptions import InvalidAuth
from models.user_model import UserModel

from models.auth_model import RoleName


# AAD auth
azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=os.environ.get("CLIENT_ID"),
    tenant_id=os.environ.get("TENANT_ID"),
    allow_guest_users=True,
    scopes={
        f'{os.environ.get("AAD_IDENTIFIER_URI")}/user_impersonation': 'user_impersonation',
    }
)

async def validate_is_in_any_app_role(user: User = Depends(azure_scheme)) -> UserModel:
    """
    Validate that a user is in the any app role in order to access the API.
    Raises a 401 authentication error if not.
    """
    if RoleName.Researcher not in user.roles and RoleName.DataManager not in user.roles and RoleName.Admin not in user.roles:
        raise InvalidAuth('User is not any app role')
    return UserModel(user)

async def validate_is_researcher_user(user: User = Depends(azure_scheme)) -> UserModel:
    """
    Validate that a user is in the `Researcher` role in order to access the API.
    Raises a 401 authentication error if not.
    """
    if RoleName.Researcher not in user.roles:
        raise InvalidAuth('User is not a Researcher')
    return UserModel(user)

async def validate_is_data_manager_user(user: User = Depends(azure_scheme)) -> UserModel:
    """
    Validate that a user is in the `DataManager` role in order to access the API.
    Raises a 401 authentication error if not.
    """
    if RoleName.DataManager not in user.roles:
        raise InvalidAuth('User is not a DataManager')
    return UserModel(user)

async def validate_is_admin_user(user: User = Depends(azure_scheme)) -> UserModel:
    """
    Validate that a user is in the `Admin` role in order to access the API.
    Raises a 401 authentication error if not.
    """
    if RoleName.Admin not in user.roles:
        raise InvalidAuth('User is not an Admin')
    return UserModel(user)
