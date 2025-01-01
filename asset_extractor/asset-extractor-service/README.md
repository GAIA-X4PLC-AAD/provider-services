# Description
Extract an archive from an asset and another user inputs by calling a pipeline of all the tools of the data providers starting from the tool https://github.com/GAIA-X4PLC-AAD/provider-tools/tree/main/asset_extraction and depending on the type of asset entered.

# Motivation
Automatic process to generate an asset archive from Asset file and another media files.

### Content

```
├── client
    Frontend functionality and GUI components
├── public
    Static files for styling, including CSS and assets
├── Python
    Python tools downloading and installation requirments 
├── server
    Backend logic and Python script handling
├── views
    Frontend template
├── Dockerfile
    Docker container configuration
├── README.md
├── tsconfig.json & package.json
    TypeScript and Node.js configurations, including dependencies and compiler options

```
# Prerequisites
Obtain a valid GitHub token. This token is required for the asset-extractor service to function properly. You need to store it in GITHUB_TOKEN environment variable and provide it either using a .env file or as a system environment variable.
