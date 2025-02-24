# syntax=docker/dockerfile:1
FROM ubuntu:22.04 as mimic-base-core
RUN <<EOF
  echo "Very slow apt-get goes here: `date`"
  apt-get update
  apt-get install -y nodejs npm yarn
  echo "Done with apt-get: `date`"
EOF
COPY k8s/mimic/docker/mimic-base-core.txt mimic-base-core.txt
RUN echo "rebuilding mimic-base-core: `date`"

FROM mimic-base-core as mimic-base-1
COPY k8s/mimic/docker/mimic-base-1.txt mimic-base-1.txt
RUN echo "rebuilding mimic-base-1: `date`"

FROM mimic-base-core as mimic-base
COPY k8s/mimic/docker/mimic-base.txt mimic-base.txt
RUN echo "rebuilding mimic-base: `date`"
COPY --link --from=mimic-base-1 / ./
RUN ls -l | grep mimic
RUN echo "Final build of mimic-base: `date`"
