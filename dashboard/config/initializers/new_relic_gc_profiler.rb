if defined?(::NewRelic) && !::NewRelic::Agent.config[:disable_gc_profiler]
  # Enable GC profiler for New Relic instrumentation.
  GC::Profiler.enable
end
