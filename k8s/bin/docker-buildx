#!/bin/bash
# Skaffold still doesn't have native builder support for `docker buildx`, which is
# essential both for getting multi-platform builds AND perhaps more importantly
# for being able to use a registry cache (or even inline cache), especially with
# multiple source images that layer together.
#
# Without this, every build is from scratch and is slow, because our GitHub actions
# builder doesn't maintain a local docker cache between builds.
#
# I've tested trying to hack some degree of layer caching in without using a custom
# build command using BUILDKIT_INLINE_CACHE=1, but it only works when we replace
# `docker build` with `docker buildx`, and then it breaks skaffold on cache hits
# because nothing loads them back into the daemon for the next build stage, and there's
# no way to pass --push on to them (skaffold doesn't).
#
# So as ugly as this is, using a custom build command with skaffold is still the
# only real way to get layer caching + multi-stage builds, until skaffold supports
# `docker buildx` (NOT buildkit, that's not enough) natively.
#
# If you want to experiment with new builders or configuration, its recommended to
# try it out on the "toy" docker setup first, which builds fast but exhibits the
# necessary multi-stage and layer complexity, easy to double-check caching behavior:
# https://github.com/code-dot-org/code-dot-org/blob/69ec3f76a4027e3171f35304463a539ba40a633e/k8s/toy/toy.skaffold.yaml/#L1-L20

NATIVE_PLATFORM=$(docker info --format '{{.OSType}}/{{.Architecture}}' | sed -e 's/aarch64/arm64/' -e 's/x86_64/amd64/')
PLATFORMS=${PLATFORMS:=$NATIVE_PLATFORM}

# Make sure our `docker buildx` builder supports our target $PLATFORMS
for platform in ${PLATFORMS//,/ }; do
  docker buildx inspect --bootstrap | grep '^Platforms' | grep $platform || {
    echo "Platform $platform is not supported by the current builder."
    echo "Please create a new builder like 'docker buildx create --platform $PLATFORMS' and try again."
    exit 1
  }
done

# We --cache-to and --cache-from a different image name than we --push to
# because the --cache image will be an OCI tarball, and docker cannot pull
# from that. We want to use a different tag (or repo, or image) for the cache.
CACHE_IMAGE_NAME="$IMAGE-cache"
cache_from="--cache-from type=registry,ref=$CACHE_IMAGE_NAME"

# Building for multiple platforms requires pushing to a registry
# as the Docker Daemon cannot load multi-platform images. 
if [ "$PUSH_IMAGE" = true ]; then
  args="--platform $PLATFORMS --push"
  cache_to="--cache-to type=registry,ref=$CACHE_IMAGE_NAME"
else
  args="--load"
fi

set -x # show the command
docker buildx build --tag $IMAGE $args $cache_from $cache_to "$BUILD_CONTEXT" $@
