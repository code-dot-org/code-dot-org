FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
ENV USE_JEMALLOC=0

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  libc-bin \
  libjemalloc2 \
  ruby \
  && rm -rf /var/lib/apt/lists/*

COPY jemalloc.rb ./jemalloc.rb
COPY jemalloc-tester/jemalloc_check.rb ./jemalloc_check.rb
COPY jemalloc-tester/run_jemalloc_check.rb ./run_jemalloc_check.rb

CMD ["ruby", "./run_jemalloc_check.rb"]
