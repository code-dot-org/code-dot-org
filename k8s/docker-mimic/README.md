Mimic is a quick to build skaffold+docker setup that emulates the complex layering we use on the slow-to-build real deal. Good for figuring out build and caching issues

Run mimic:
skaffold -f k8s/mimic/mimic.skaffold.yaml dev

## Testing Docker

Build mimic with skaffold's caching layer disabled to debug docker layer caching:
```
skaffold -f k8s/mimic/mimic.skaffold.yaml build --tag mimic --cache-artifacts=false
```

You can then run the resulting image in docker with:
```
docker run -it mimic:mimic
```

or, if you have `skaffold config set default-repo ghcr.io/code-dot-org set:
```
docker run -it ghcr.io/code-dot-org/mimic:mimic
```
