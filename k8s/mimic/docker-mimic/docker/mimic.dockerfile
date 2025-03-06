# syntax=docker/dockerfile:1

ARG MIMIC_BASE
FROM $MIMIC_BASE AS mimic-base

FROM mimic-base as mimic-1
COPY k8s/mimic/docker/mimic-1.txt mimic-1.txt
RUN echo "rebuilding mimic-1: `date`"
COPY k8s/mimic/docker/package.json package.json
RUN npm install

FROM mimic-base
COPY k8s/mimic/docker/mimic.txt mimic.txt
RUN echo "rebuilding mimic: `date`"
COPY --link --from=mimic-1 / ./
RUN ls -l | grep mimic
RUN echo "Final build of mimic: `date`"
