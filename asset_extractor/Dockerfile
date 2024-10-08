# base image  Node.js
FROM node:20-slim

WORKDIR /app

# Node.js dependencies
COPY /services/asset_extractor/package*.json ./
RUN npm install

COPY /services/asset_extractor/ .

COPY /tools/configs/ /app/configs/
COPY /tools/format_selector/ /app/scripts/format_selector/
COPY /tools/jsonLD_creator/ /app/scripts/jsonLD_creator/
COPY /tools/meta_data_extractor/ /app/scripts/meta_data_extractor/
COPY /tools/structure_creator/ /app/scripts/structure_creator/
COPY /tools/xodr_reducer/ /app/scripts/xodr_reducer/
COPY /tools/xodr_routing_creator/ /app/scripts/xodr_routing_creator/
COPY /tools/OpenValidator/ /app/scripts/OpenValidator/
#COPY /tools/xodr_to_geojson_converter/ /app/scripts/xodr_to_geojson_converter/

# install Python 3
RUN apt update && \
    apt -y upgrade &&\
    apt install -y python3 python3-venv &&\
    rm -rf /var/lib/apt/lists/*

#activate & pack the python deps in a venv
ENV VIRTUAL_ENV=/app/python/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="/app/python/venv/bin:$PATH"

RUN python3 -m pip install --upgrade pip
# python dependencies:
RUN for dir in /app/scripts/*/ ; do \
    if [ -f "$dir/requirements.txt" ]; then \
        pip3 install -r "$dir/requirements.txt"; \
    fi; \
done

# transpile typeScript code
RUN npm run build

# Expose the port app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
