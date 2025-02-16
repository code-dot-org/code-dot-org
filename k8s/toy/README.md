Toy is a quick to build skaffold+docker setup that emulates the complex layering we use on the slow-to-build real deal. Good for figuring out build and caching issues

Run toy:
skaffold -f k8s/toy/toy.skaffold.yaml dev

## Testing Docker

Build toy with skaffold's caching layer disabled to debug docker layer caching:
```
skaffold -f k8s/toy/toy.skaffold.yaml build --tag toy --cache-artifacts=false 
```

You can then run the resulting image in docker with:
```
docker run -it toy:toy
```

or, if you have `skaffold config set default-repo ghcr.io/code-dot-org set:
```
docker run -it ghcr.io/code-dot-org/toy:toy
```
