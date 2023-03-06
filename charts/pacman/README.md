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

For Openshift use a route and remove the security context otherwise the 
mongodb securityContext will be created with the user 1001 which is not allowed 
by default in Openshift.
```
helm install pacman pacman/pacman -n pacman --create-namespace \
    --set route.create= \
    --set mongodb.containerSecurityContext.enabled=false \
    --set mongodb.podSecurityContext.enabled=false
```

## Other installation options:
```
helm show values pacman/pacman
```