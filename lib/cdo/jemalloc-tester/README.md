# jemalloc tester

Run all tests:

```bash
./test.sh
```

## Manual Build
```bash
cd ..
docker build . -t temp-jemalloc-check -f jemalloc-tester/Dockerfile
```

## Manual Run (without jemalloc)
```bash
docker run --rm -e USE_JEMALLOC=0 temp-jemalloc-check
```

## Manual Run (with jemalloc)
```bash
docker run --rm -e USE_JEMALLOC=1 temp-jemalloc-check
```
