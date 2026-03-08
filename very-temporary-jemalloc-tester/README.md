# jemalloc tester

## Build
```bash
docker build -t temp-jemalloc-check very-temporary-jemalloc-tester
```

## Run (without jemalloc)
```bash
docker run --rm -e USE_JEMALLOC=0 temp-jemalloc-check
```

## Run (with jemalloc)
```bash
docker run --rm -e USE_JEMALLOC=1 temp-jemalloc-check
```
