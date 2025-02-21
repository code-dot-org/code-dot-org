# syntax=docker/dockerfile:1
FROM ubuntu:22.04 as toy-base-core
RUN <<EOF
  echo "Very slow apt-get goes here: `date`"
  apt-get update
  echo "Done with apt-get: `date`"
EOF
COPY k8s/toy/toy-base-core.txt toy-base-core.txt
RUN echo "rebuilding toy-base-core: `date`"

FROM toy-base-core as toy-base-1
COPY k8s/toy/toy-base-1.txt toy-base-1.txt
RUN echo "rebuilding toy-base-1: `date`"

FROM toy-base-core as toy-base
COPY k8s/toy/toy-base.txt toy-base.txt
RUN echo "rebuilding toy-base: `date`"
COPY --link --from=toy-base-1 / ./
RUN ls -l | grep toy
RUN echo "Final build of toy-base: `date`"