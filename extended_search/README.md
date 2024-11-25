# Description
Search a binary reduced open drive data (see asset extractor) using a set of pre-implemented python search scripts based on various predefined search parameters (criteria)

# Motivation
The need for efficient, flexible and focused open drive data exploration.

### Content

```
├── client
    Frontend functionality and GUI components
├── public
    Static files for styling, including CSS and assets
├── Python
    Python search scripts, reduced binary xodr downloading and installation requirments 
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
    docker build --no-cache -t extended-search .    

# How to run
1. run docker container:
    docker run -p 3000:3000 extended-search <bjsonUrl1> <bjsonUrl2> ... <bjsonUrlN>
    bjsonUrls are passed as positional parameters and separated by spaces.
    Example:
    ```
    docker run -p 3000:3000 extended-search https://github.com/GAIA-X4PLC-AAD/map-and-scenario-data/blob/FB_FormatSelector/data/001_A9_Eching_MinimumSample/ODR-3DM/services/A9_Eching_MinimumSample_offset.bjson https://github.com/GAIA-X4PLC-AAD/map-and-scenario-data/blob/FB_FormatSelector/data/002_MarktplatzGrafing/ODR-3DM/services/MarktplatzGrafing_offset.bjsonrSample/ODR-3DM/services/AnotherSample.bjson
    ```


2. Open a client (on a browser open): 
    http://localhost:3000/search
