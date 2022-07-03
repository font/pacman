FROM registry.access.redhat.com/ubi8/ubi-minimal

MAINTAINER Rodrigo Alvares  <ralvares@redhat.com>
USER root 
RUN microdnf update -y && microdnf upgrade -y && \
    microdnf module enable nodejs:16 && microdnf install nodejs && \
    mkdir -p /opt/app-root/src/pacman && \
    rpm -e --nodeps $(rpm -qa '*rpm*' '*dnf*' '*libsolv*' '*hawkey*' 'yum*' 'curl' )

COPY . /opt/app-root/src/pacman
WORKDIR /opt/app-root/src/pacman
RUN npm install
EXPOSE 8080

USER 1001

CMD ["npm", "start"]
