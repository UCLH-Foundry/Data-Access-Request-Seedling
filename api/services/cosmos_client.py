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
import logging
from azure.cosmos import CosmosClient, ContainerProxy
from azure.identity import DefaultAzureCredential


def cosmos_client() -> ContainerProxy:
    """
    CosmosDB client for connecting with the state store.

    Documentation: https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/sdk-python
    """
    
    client = CosmosClient(
        os.environ["COSMOS_STATE_STORE_ENDPOINT"],
        credential=(DefaultAzureCredential()),
        connection_verify=(True),
    )
    app_name = 'data_access_request'
    database = client.get_database_client(f'{app_name}-state')
    container = database.get_container_client(app_name)
    logging.info("Cosmos container client created.")
    return container
