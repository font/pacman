FROM registry.access.redhat.com/ubi8/nodejs-16

MAINTAINER Rodrigo Alvares  <ralvares@redhat.com>
USER root 
RUN yum update && yum upgrade -y 

USER 1001
# Clone game source code
RUN git clone https://github.com/ralvares/pacman.git

# Install app dependencies
WORKDIR /opt/app-root/src/pacman

RUN npm install

# Expose port 8080
EXPOSE 8080

# Run container
CMD ["npm", "start"]
