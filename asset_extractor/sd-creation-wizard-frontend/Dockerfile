# Stage 1: Build Angular App
FROM node:20 AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY implementation/package.json implementation/package-lock.json ./
RUN npm install

# Install Angular CLI globally
#RUN npm install -g @angular/cli

# Copy the full Angular project code
COPY implementation /app

# Build the Angular app
RUN npx ng build

# Stage 2: Serve with Nginx
FROM nginx:1.17.8-alpine

# Copy build files to the Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html/
#COPY implementation/dist .
EXPOSE 80

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]