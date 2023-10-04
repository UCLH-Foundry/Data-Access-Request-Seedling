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

import logging
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.ext.flask.flask_middleware import FlaskMiddleware
from opencensus.trace.samplers import ProbabilitySampler

def setup_azurelog_exporter(environment: str, app: any, instrumentation_key: str):
    try:
        FlaskMiddleware(
            app,
            exporter=AzureExporter(connection_string=instrumentation_key),
            sampler=ProbabilitySampler(rate=1.0),
        )
        logging.info("Azure Log exporter initialised.")
    except Exception as e:
        if environment == "local":
            logging.info(f"Flask middleware - Azure Log Exporter not set.: {e}")
        else:
            logging.error(f"Failed to set Flask middleware - Azure Exporter: {e}")
            raise e
