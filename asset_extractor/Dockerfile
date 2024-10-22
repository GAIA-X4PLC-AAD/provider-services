# base image  Node.js
FROM node:20-slim

WORKDIR /app

# Node.js dependencies
COPY package*.json ./
RUN npm install

COPY . .

# install Python 3
RUN apt  update && \
    apt -y upgrade &&\
    apt install -y python3 python3-venv &&\
    rm -rf /var/lib/apt/lists/*

#activate & pack the python deps in a venv
ENV VIRTUAL_ENV=/app/python/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="/app/python/venv/bin:$PATH"

# gitcloner python dependencies:
COPY /python/requirements.txt /app/python/requirements.txt
RUN pip install -r /app/python/requirements.txt
    
# transpile TypeScript
RUN npm run build

# Expose the port app runs on
EXPOSE 3000

# run the application
CMD ["npm", "start"]
