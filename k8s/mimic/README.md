# Mimic

Because our docker image is 10GB+, its very slow for doing iterative development
of the docker image, and the associated helm charts. Mimic was created to fix this.
If our repo was <1GB we wouldn't need mimic at all.

Mimic allows rendering the code-dot-org docker images and helm charts using a much
smaller file context. See: `k8s/mimic/code-dot-org`, which is made of stub files
and symlinks.

## Using Mimic

To run a mimic, from the repo root:
1. Build the mimic context: `skaffold build -p mimic --cache-artifacts=false`
2. Run: `skaffold dev -p mimic`

This will build and run the same k8s charts, but MUCH faster. Instead of our
real application, the resulting services will use stubbed out applications.

## Modify Mimic when you use COPY in a Dockerfile

Every file depended on by k8s/docker/*dockerfile needs to be present in
k8s/mimic/code-dot-org too. You can either symlink in the real file (recommended)
or if a simplifcation is called for, you can directly create a stub file.

### Scenario

Example, imagine I just added a docker build stage which runs `yarn install`
in a new JS directory, `newjs/`.

Say I added this line to k8s/docker/code-dot-org.dockerfile:
```
COPY frontend/newjs/package.json frontend/newjs/package.json
```

Now mimic will break, because k8s/mimic/code-dot-org/newjs/package.json does
not exist:
```
getting hash for artifact "mimic": getting dependencies for "mimic": file pattern [newjs/package.json] must match at least one file
```

#### Fix

1. Lets symlink the real newjs/package.json file in to solve the problem:
```
cd k8s/mimic/code-dot-org
mkdir -p newjs
cd newjs
ln -s ../../../../newjs/package.json
```
2. Finally, to the update cdo-no-symlinks dir, run: `skaffold build -p mimic --cache-artifacts=false`

Now `skaffold dev -p mimic` should work again.

## The cdo-no-symlinks directory

- used as the docker context (='base filesystem) for the mimic
- a symlink-free copy of k8s/mimic/code-dot-org, which contains symlinks to "real files" referenced in .dockerfiles
- auto-created by `./bin/update-cdo-no-symlinks.sh`
  - which is invoked by `skaffold build -p mimic --cache-artifacts=false`
- can be deleted at any time
- See `./bin/update-cdo-no-symlinks.sh` for details

## Common Errors

If you get an errors like: 
- `image "mimic" context "k8s/mimic/cdo-no-symlinks" does not exist`
- or `getting hash for artifact "mimic": getting dependencies for "mimic-core": file pattern [whatever] must match at least one file`

You need to manually re-run:
```
k8s/mimic/bin/create-cdo-no-symlinks.sh
```
