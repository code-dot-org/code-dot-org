require 'benchmark'

def jemalloc_preloaded?
  maps = File.exist?('/proc/self/maps') ? File.read('/proc/self/maps') : ''
  maps.include?('libjemalloc')
end

jemalloc_loaded = nil
elapsed_ms = Benchmark.realtime do
  jemalloc_loaded = jemalloc_preloaded?
end * 1000.0

puts "jemalloc_preloaded?=#{jemalloc_loaded}, took #{elapsed_ms.round(5)} ms to check"
