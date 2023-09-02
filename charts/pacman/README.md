# Pac-Man for Kubernetes Helm chart.

## Add repository
```
helm repo add pacman https://shuguet.github.io/pacman/
```

## Install

Standard, ClusterIP-based deployment:
```
helm install pacman pacman/pacman -n pacman --create-namespace
```

## Other access mode available:

Ingress (you need to have one. Adapt the class/host to your environment):
```
helm install pacman pacman/pacman -n pacman --create-namespace \
    --set ingress.create=true \
    --set ingress.class=<LB_CLASS> \
    --set ingress.host=<LB_HOST>
```

LoadBalancer (you need to have one. Adapt the class/host to your environment):
```
helm install pacman pacman/pacman -n pacman --create-namespace \
    --set service.type=LoadBalancer
```

Route (Requires an OpenShift installation. Adapt the class/host to your environment):
```
helm install pacman pacman/pacman -n pacman --create-namespace \
    --set route.create=true
```

## Other installation options:
```
helm show values pacman/pacman
```