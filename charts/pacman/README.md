# Pac-Man for Kubernetes Helm chart.

## Add repository
```
helm repo add pacman https://shuguet.github.io/pacman/
```

## Install

```
helm install pacman pacman/pacman --name=pacman --create-namespace
```