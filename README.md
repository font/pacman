# Pac-Man
Pac-Man Demo App for Kubernetes

![GitHub](https://img.shields.io/github/license/shuguet/pacman)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/pacman)](https://artifacthub.io/packages/search?repo=pacman)
![Build & Publish Container](https://github.com/shuguet/pacman/actions/workflows/docker-image.yaml/badge.svg)

## Installation instructions:
[Using Helm](https://artifacthub.io/packages/helm/pacman/pacman)

## Development instructions

#### Getting started

Build the image locally once, to check everything is working fine
```
./scripts/build.sh
```

Once inside the build environment, you can use
```
npm install
```
to update/install newer versions of the Node.js packages used by the app.

If you don't see any error, you should proceed with starting the development environment
```
./scripts/dev.sh
```

You should be inside one container, on the same network as a running MongoDB database server.
```
npm run dev
```

You should see your Node.js server logs, keep the server running.
Open a new browser windows, navigate to `http://localhost:8000/`, you should see the Pac-Man game.

## Create Application Artifacts

### Docker Container Image

The [Dockerfile](Dockerfile) performs the following steps:

1. It is based on the latest Node.js.
1. It then ADD the Pac-Man game into the configured application directory.
1. Exposes port 8080 for the web server.
1. Starts the Node.js application using `npm start`.

To build the image in preparation for hosting it to your own repo, run:

```
docker build -t <registry>/<user>/pacman .
```

You can test the image by running:

```
docker run -p 8000:8080 <registry>/<user>/pacman
```
Note: You will need a working MongoDB backend. Look at [scripts/dev.sh] to understand how you can setup a local one on your machine using an insecure password, for development purposes only.

Once you're satisfied you can push the image to your container registry.

```
docker push <registry>/<user>/pacman
```

#### Helm Chart
Explore [charts/pacman](charts/pacman) to understand how the chart is built.
To host your own, you will need to setup a [Helm Repository](https://helm.sh/docs/topics/chart_repository/)