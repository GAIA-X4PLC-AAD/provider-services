# Description
Extract an archive from an asset and another user inputs by calling a pipeline of all the tools of the data providers starting from the tool https://github.com/GAIA-X4PLC-AAD/provider-tools/tree/main/asset_extraction and depending on the type of asset entered.

# Motivation
Automatic process to generate an asset archive from Asset file and another media files.

# Build docker image
    docker build --no-cache -t asset-extractor .    

# How to run
    1. docker run -p 3000:3000 asset-extractor
    2. Open a client (on a browser open): http://localhost:3000/assetSelect
