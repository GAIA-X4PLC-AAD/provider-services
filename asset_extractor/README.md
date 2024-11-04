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

# Build docker image
    docker build --no-cache -t asset-extractor .    

# How to run
1. run docker container:
    docker run -p 3000:3000 asset-extractor
2. Open a client (on a browser open): 
    http://localhost:3000/
