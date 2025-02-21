Toy is a quick to build skaffold+docker setup that emulates the complex layering we use on the slow-to-build real deal. Good for figuring out build and caching issues

```
skaffold build -f k8s/toy/toy.skaffold.yaml --cache-artifacts=false --tag booyah
```