require 'benchmark'

module I18n
  module Sync
    module Metrics
      module_function

      def runtime(process)
        start = Time.now
        # clock_start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        elapse = Benchmark.realtime {yield}
        # clock_stop = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        # elapsed = clock_stop - clock_start
        puts "#{Time.now.utc.iso8601},#{process},#{start},#{elapse.to_i}"
      end
    end
  end
end
