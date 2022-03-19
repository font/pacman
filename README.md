# pacman
Pac-Man

## Install dependencies

```
npm install
```

## Getting started

```
npm run start
```

## Development

```
npm run dev
```

## Create Application Container Image

### Docker Container Image

The [Dockerfile](docker/Dockerfile) performs the following steps:

1. It is based on the latest Node.js.
1. It then ADD the Pac-Man game into the configured application directory.
1. Exposes port 8080 for the web server.
1. Starts the Node.js application using `npm start`.

To build the image run:

```
docker build -t <registry>/<user>/pacman-nodejs-app .
```

You can test the image by running:

```
docker run -p 8000:8080 <registry>/<user>/pacman-nodejs-app
```
Note: You will need a working MongoDB backend. Look at: [scripts/dev.sh] to setup a local one on your machine using insecure password

Once started, go to `http://localhost:8000/` to see if you get the Pac-Man game.

Once you're satisfied you can push the image to your container registry.

```
docker push <registry>/<user>/pacman-nodejs-app
```