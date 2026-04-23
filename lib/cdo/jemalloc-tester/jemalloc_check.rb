require 'benchmark'
require_relative './jemalloc'

jemalloc_loaded = nil
elapsed_ms = Benchmark.realtime do
  jemalloc_loaded = Cdo::Jemalloc.preloaded?
end * 1000.0

puts "preloaded?=#{jemalloc_loaded}, took #{elapsed_ms.round(5)} ms to check"
