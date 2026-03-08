FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
ENV USE_JEMALLOC=0

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  libc-bin \
  libjemalloc2 \
  ruby \
  && rm -rf /var/lib/apt/lists/*

RUN cat > jemalloc_check.rb <<'RUBY'
  require 'benchmark'

  def is_jemalloc_preloaded?
    maps = File.exist?('/proc/self/maps') ? File.read('/proc/self/maps') : ''
    maps.include?('libjemalloc')
  end

  jemalloc_loaded = nil
  elapsed_ms = Benchmark.realtime do
    jemalloc_loaded = is_jemalloc_preloaded?
  end * 1000.0

  puts "is_jemalloc_preloaded?=#{jemalloc_loaded}, took #{elapsed_ms.round(5)} ms to check"
RUBY

# Preload JEMALLOC if USE_JEMALLOC is set to "1"
RUN cat > run_jemalloc_check.sh <<'SH'
  if [[ "${USE_JEMALLOC:-0}" == "1" || "${USE_JEMALLOC:-}" == "true" ]]; then
    export LD_PRELOAD="libjemalloc.so.2"
  fi

  exec ruby ./jemalloc_check.rb
SH

CMD ["bash", "./run_jemalloc_check.sh"]
