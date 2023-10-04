# Data Access Request Seedling

This repo provides a template to accelerate the development of a custom data access request tool. It:
- Allows a user with a 'Researcher' role to create new Data Access Requests
- A user with 'DataManager' role can approve / reject that request
- All changes are tracked in the item history
- When approved, an ADF pipeline is triggered to provision the data

### Getting Started
To get started, ensure you have the following tools installed and set up:
- VS Code
- Docker

1. Clone this repo
1. Open in VS Code, and follow the prompt to Reopen in Dev Container. This will reopen VS Code and start to build a new container containing all the tools and dependencies you need to work in this project.
1. Set up your environment variables: `cp .env.dev.sample .env.dev`. Change the `__CHANGE_ME__` values as appropriate.
1. Login to Azure with the CLI: `az login --tenant <tenant_id>`. Follow the prompts in the terminal / browser to log in with your MS account.
1. Run the API: `make run-api`. This will run the API locally, at `http://localhost:8000`. Your local API code will connect to the shared Cosmos account, hosted in Azure.
1. Run the UI: `make run-app`, and open a browser to `http://localhost:3000`. Changes to the UI code will be immediately reflected in the browser.


## Manual Steps
Given the current time constraints, it has not been possible to automate everything, so there are some manual steps. An Azure Administrator will need to perform these steps.

### Environment Vars
The API needs the following manual environment vars set (In the Azure Portal -> Web Apps -> data access web app -> Configuration):
- `ADF_RESOURCE_GROUP`="name of the resource group containing the data factory"
- `ADF_NAME`="name of the data factory"
- `ADF_PIPELINE_NAME`="name of the data factory pipeline to trigger"
- `FLOWEHR_NAME`="name of the FlowEHR deployment" // TODO: Add this to the FlowEHR build so it's set automatically

If these are not set, the app will fall back to constructing these values via the `FLOWEHR_NAME`

### Setting Permissions in Test / Prod
To give permissions for the DAR web app to trigger ADF pipelines, it needs permissions to the data factory deployed through FlowEHR.
- Find the Data Factory in the portal.
- Access Control (IAM)
- Add Role Assignment
- Select "Data Factory Contributor" -> Next
- Select "Managed Identity" -> "+ Select Members" -> Select "App Service" in the dropdown and then select the Data Access Request App.
- Review + Assign

Now the identity that runs the data access request app has permission to trigger pipelines in ADF.
