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

import base64
import os
from azure.identity import DefaultAzureCredential
from azure.mgmt.datafactory import DataFactoryManagementClient
from azure.mgmt.datafactory.models import *

from models.request_model import RequestModel


def trigger_pipeline(request: dict):
    
    # Define the variables for authentication and data factory
    environment = os.environ.get("ENVIRONMENT", default="test")
    flowehr_name = os.environ.get("FLOWEHR_NAME", default="flwr")
    subscription_id = os.environ.get("SUBSCRIPTION_ID", default="")
    resource_group_name = os.environ.get("ADF_RESOURCE_GROUP", default=f'rg-{flowehr_name}-{environment}')
    data_factory_name = os.environ.get("ADF_NAME", default=f'adf-{flowehr_name}-{environment}')
    pipeline_name = os.environ.get("ADF_PIPELINE_NAME", default="DatasetProvisioning")

    # Define the custom parameters for the pipeline run
    parameters = {
        "query_base64": base64.b64encode(request['cohortSelectionQuery'].encode('ascii')).decode('ascii'), # encode as base64, then decode to ascii for sending
        "dataset_name": request['dataset'],
        "workspace_id": request['workspaceId'],
    }

    # Create a credential object using az login (for dev) or MSI in production
    credential = DefaultAzureCredential()

    # Create a data factory client object
    adf_client = DataFactoryManagementClient(credential, subscription_id)

    # Trigger the pipeline run with the custom parameters
    run_response = adf_client.pipelines.create_run(
        resource_group_name=resource_group_name,
        factory_name=data_factory_name,
        pipeline_name=pipeline_name,
        parameters=parameters
    )

    # contruct a link to the pipeline run, and return it
    link_to_run = f'https://adf.azure.com/en/monitoring/pipelineruns/{run_response.run_id}?factory=%2Fsubscriptions%2F{subscription_id}%2FresourceGroups%2F{resource_group_name}%2Fproviders%2FMicrosoft.DataFactory%2Ffactories%2F{data_factory_name}'
    return link_to_run
