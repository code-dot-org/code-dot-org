DOCKER-MIMIC IS NOT USED BY THE REGULAR MIMIC, its just a test bed for docker layering, not a full k8s app

You may be looking for the main "full mimic", which is located in: ../

docker-mimic is a quick to build skaffold+docker setup that emulates the complex layering we use on the slow-to-build real deal. Good for figuring out build and caching issues

Run docker-mimic:
skaffold -f k8s/docker-mimic/docker-mimic.skaffold.yaml dev

## Testing Docker

Build docker-mimic with skaffold's caching layer disabled to debug docker layer caching:
```
skaffold -f k8s/mimic/docker-mimic/docker-mimic.skaffold.yaml build --tag docker-mimic --cache-artifacts=false
```

You can then run the resulting image in docker with:
```
docker run -it docker-mimic:docker-mimic
```

or, if you have `skaffold config set default-repo ghcr.io/code-dot-org set:
```
docker run -it ghcr.io/code-dot-org/docker-mimic:docker-mimic
```
