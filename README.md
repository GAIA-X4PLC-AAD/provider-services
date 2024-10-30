Map and Scenario Data
====

## Description
This repository contains all the services of the data providers

### Docker
Building and running provider services with Docker engine in https://docs.docker.com/engine/install/

### Content

```
├── asset_extractor
	Dockerized NodeJS application to extract asset archive from uploaded open drive/open scenario asset file and a variety of media files.  
	Frontend to upload files which are processed on the Backend with python tools copied from:
		https://github.com/GAIA-X4PLC-AAD/provider-tools.git
		https://github.com/GAIA-X4PLC-AAD/OpenValidator.git
├── extended_search
	Dockerized NodeJS application for extended search in binary reduced open drive data (see asset extractor). 
	Frontend to select one of available python search scripts and fill search parameters. Backend to execute the extended search on the reduced data with these parameters values.
├── CONTRIBUTING.md
├── LICENSE.md
├── Readme.md
```


