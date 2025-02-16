# syntax=docker/dockerfile:1

ARG TOY_BASE
FROM $TOY_BASE AS toy-base

FROM toy-base as toy-1
COPY k8s/toy/docker/toy-1.txt toy-1.txt
RUN echo "rebuilding toy-1: `date`"
COPY k8s/toy/docker/package.json package.json
RUN npm install

FROM toy-base
COPY k8s/toy/docker/toy.txt toy.txt
RUN echo "rebuilding toy: `date`"
COPY --link --from=toy-1 / ./
RUN ls -l | grep toy
RUN echo "Final build of toy: `date`"
