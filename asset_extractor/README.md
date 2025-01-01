# Asset extraction consists of the following services:

- asset-extractor: The core service that handles asset extraction logic.
- [sd-creation-wizard-frontend](https://gitlab.eclipse.org/eclipse/xfsc/self-description-tooling/sd-creation-wizard-frontend) : To complete the prefabricated claim file and combined Shacl.
- [sd-creation-wizard-api](https://gitlab.eclipse.org/eclipse/xfsc/self-description-tooling/sd-creation-wizard-api) : Backend service to serve sd-creation-wizard frontend

# Additional Notes

- SD-Creation-Wizard frontend and API is part of Gaia-X project and have been adapted to suit the specific requirements of this project.
- The service is designed to be standalone and does not require additional installations beyond Docker Engine to run. If Docker Engine is not already installed on your system, follow the installation instructions provided on [Docker Engine website](https://docs.docker.com/engine/install).

# How to Build and Run
To build and run the application, use the following command:
```bash
docker compose up --build
```
After the initial build, you can start the application without rebuilding the images by running:
```bash
docker compose up
```
Open a client (on a browser open): 
+ http://localhost:3000/

