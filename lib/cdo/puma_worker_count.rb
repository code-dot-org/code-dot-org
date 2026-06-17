require 'concurrent'

module Cdo
  # Resolves the puma worker count for the dashboard cluster.
  #
  # Historically we sized purely by CPU: puma's `:auto`, i.e. one worker per
  # available vCPU (`Concurrent.available_processor_count`). Production
  # measurement showed that CPU is not the binding resource on our frontends;
  # memory is. At steady state each worker's PSS (its contribution to system
  # "used" memory, with copy-on-write pages counted once) approaches ~3.4 GB,
  # so one worker per vCPU on a 4 GB/vCPU instance drives total used memory
  # into the 87% alarm shortly before the scheduled worker restart recycles
  # them.
  #
  # We therefore size by the smaller of two budgets:
  #   - CPU:    one worker per available vCPU (the old `:auto`).
  #   - Memory: how many workers fit in RAM, leaving headroom for the master,
  #             memcached/redis/collector sidecars, the OS, and per-worker
  #             variance.
  #
  # Both budgets adapt to the instance automatically. An explicit numeric
  # `dashboard_workers` still overrides everything (dev = 0 single-mode,
  # test = 5, manually-pinned daemons), preserving prior behavior.
  #
  # Tuning the memory budget (`dashboard_worker_memory_mb`): measure actual
  # per-worker memory on a frontend and set the budget at or above what you
  # observe, with slack. Use PSS, not RSS -- the host's "used" memory (what
  # the memory alarm watches) counts each physical page once, so copy-on-write
  # pages shared with the master must not be double-counted. Per-worker memory
  # grows with worker age, so sample an instance late in its restart cycle to
  # capture the near-peak value, not a freshly-forked one:
  #
  #   for pid in $(pgrep -f 'puma: cluster worker'); do
  #     awk '/^Pss:/{s=$2} END{printf "%d MB\n", s/1024}' "/proc/$pid/smaps_rollup"
  #   done | sort -n | tail -1   # the heaviest worker's PSS
  #
  # Revisit after any instance-type or per-worker-thread change. The headroom
  # fraction (`dashboard_worker_memory_headroom`) covers non-worker users
  # (master, sidecars, OS) and per-worker variance; raise it if those grow.
  module PumaWorkerCount
    MEMINFO = '/proc/meminfo'.freeze

    # Resolve the worker count from live system facts and CDO config.
    # Called from dashboard/config/puma.rb.
    def self.resolve
      compute(
        explicit: CDO.dashboard_workers,
        cpu_count: Concurrent.available_processor_count,
        total_memory_mb: total_memory_mb,
        per_worker_mb: CDO.dashboard_worker_memory_mb,
        headroom: CDO.dashboard_worker_memory_headroom
      )
    end

    # Pure worker-count calculation; all inputs explicit for testability.
    #
    # @param explicit         [Integer, String, nil] configured dashboard_workers
    # @param cpu_count        [Integer] available vCPUs
    # @param total_memory_mb  [Integer, nil] system RAM in MB, nil if unknown
    # @param per_worker_mb    [Numeric] assumed used-memory budget per worker
    # @param headroom         [Numeric] fraction of RAM reserved for non-workers
    # @return [Integer] worker count (0 means puma single mode)
    def self.compute(explicit:, cpu_count:, total_memory_mb:, per_worker_mb:, headroom:)
      # An explicit count always wins, including 0 (single mode). Accept a
      # bare integer or an integer-valued string (quoted YAML, env var); a
      # non-integer string falls through to the computed budget rather than
      # silently disabling the cap.
      return explicit if explicit.is_a?(Integer)
      return explicit.to_i if explicit.is_a?(String) && explicit.match?(/\A\d+\z/)

      # Without a memory reading (e.g. dev/macOS, where /proc is absent),
      # fall back to the CPU budget alone (the historical `:auto` behavior).
      return cpu_count unless total_memory_mb

      memory_workers = (total_memory_mb * (1.0 - headroom) / per_worker_mb).floor
      [cpu_count, memory_workers].min.clamp(1, cpu_count)
    end

    # Total system RAM in MB, or nil if it cannot be determined (so callers
    # fall back to CPU-based sizing rather than guessing).
    def self.total_memory_mb
      return nil unless File.readable?(MEMINFO)

      line = File.foreach(MEMINFO).find {|l| l.start_with?('MemTotal:')}
      return nil unless line

      kb = line.split[1].to_i
      kb.zero? ? nil : kb / 1024
    end
  end
end
