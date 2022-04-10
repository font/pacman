FROM node:current-alpine

LABEL org.opencontainers.image.authors="sylvain@huguet.me"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install app dependencies
# Development
# RUN npm install
# Production
RUN npm ci --only=production

# Bundle app source
# Refer to .dockerignore to exclude content as needed
COPY . .

# Expose port 8080
EXPOSE 8080

# Run container
CMD [ "npm", "start" ]
