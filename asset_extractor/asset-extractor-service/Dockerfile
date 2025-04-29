# Gradle image for building the JAR from the source code on https://github.com/virtualcitySYSTEMS/opendriveconverter
#FROM gradle:8.10-jdk17 AS build 

# copy Java tool source code
#WORKDIR /java-tool
#COPY /java /java-tool

# Build the JAR file
#RUN gradle shadowJar #Did not work...need github authentication while executing to get dependencies on some VirtualCitySystem Maven repo 

# base image  Node.js
FROM node:20-slim

WORKDIR /app

# Node.js dependencies
COPY package*.json ./
RUN npm install

COPY . .

# install Python 3 & git, libxerces-c3.2 and libqt5xml5 (for quality checker dependencies) & java for OpenDRIVE to GeoJSON Converter
RUN apt-get  update && \
    apt-get -y upgrade &&\
    apt-get install -y python3 python3-venv git libxerces-c3.2 libqt5xml5 openjdk-17-jre-headless  && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the generated JAR from the builder image
#COPY --from=build /java-tool/build/libs/vcs-odr-converter-1.0.0.jar /app/python/tools/xodr_to_geojson_caller/vcs-odr-converter-1.0.0.jar

#activate & pack the python deps in a venv
ENV VIRTUAL_ENV=/app/python/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="/app/python/venv/bin:$PATH"
# (optional) set project root path for Node.js to pick up
ENV PYTHON_PROJECT_ROOT=/app/python

# gitcloner python dependencies:
COPY /python/requirements.txt /app/python/requirements.txt
RUN pip install -r /app/python/requirements.txt
    
# transpile TypeScript
RUN npm run build

# Expose the port app runs on
EXPOSE 3000

# run the application
CMD ["npm", "start"]
