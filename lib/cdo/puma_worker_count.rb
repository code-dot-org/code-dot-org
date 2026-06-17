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
  #   - Memory: how many workers fit in RAM after the headroom reserve.
  #
  # The two memory levers are deliberately orthogonal:
  #   - dashboard_worker_memory_mb is a measurement: the typical (mean)
  #     steady-state per-worker memory. Set it to what you observe.
  #   - dashboard_worker_memory_headroom is the safety policy: the fraction of
  #     RAM held back to cover everything that is not a typical worker -- the
  #     master, sidecars, the OS, the spread between the mean worker and the
  #     heaviest, and traffic-driven transients. All slack lives here, so
  #     re-measuring the per-worker figure does not silently move the margin.
  #
  # Both budgets adapt to the instance automatically. An explicit numeric
  # `dashboard_workers` still overrides everything (dev = 0 single-mode,
  # test = 5, manually-pinned daemons), preserving prior behavior.
  #
  # Tuning dashboard_worker_memory_mb: measure per-worker PSS, not RSS -- the
  # host's "used" memory (what the alarm watches) counts each physical page
  # once, so copy-on-write pages shared with the master must not be
  # double-counted. Per-worker PSS grows with worker age, so sample late in the
  # restart cycle; this figure is therefore the steady state *at the current
  # restart cadence* -- if that cadence changes, re-measure (see #73281 for the
  # plateau experiment). Use the mean; headroom owns the spread:
  #
  #   for pid in $(pgrep -f 'puma: cluster worker'); do
  #     awk '/^Pss:/{printf "%d\n", $2/1024}' "/proc/$pid/smaps_rollup"
  #   done | sort -n | awk '{a[NR]=$1; s+=$1}
  #     END{printf "n=%d mean=%d min=%d max=%d (MB)\n", NR, s/NR, a[1], a[NR]}'
  #
  # Revisit after any instance-type, restart-cadence, or per-worker-thread
  # change.
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
    # @param cpu_count        [Numeric] available vCPUs (Float from concurrent-ruby)
    # @param total_memory_mb  [Integer, nil] system RAM in MB, nil if unknown
    # @param per_worker_mb    [Numeric, nil] mean used-memory per worker
    # @param headroom         [Numeric, nil] fraction of RAM held back as reserve
    # @return [Integer] worker count (0 means puma single mode)
    def self.compute(explicit:, cpu_count:, total_memory_mb:, per_worker_mb:, headroom:)
      # An explicit count always wins, including 0 (single mode). Accept a
      # bare integer or an integer-valued string (quoted YAML, env var); a
      # non-integer string falls through to the computed budget rather than
      # silently disabling the cap.
      return explicit if explicit.is_a?(Integer)
      return explicit.to_i if explicit.is_a?(String) && explicit.match?(/\A\d+\z/)

      # available_processor_count is a Float (it reflects fractional cgroup
      # quotas), so floor it; the result must be an Integer for puma.
      cpu_workers = cpu_count.floor

      # Fall back to the CPU budget alone when the memory inputs are unusable:
      # /proc absent (dev/macOS), or a config key missing or non-numeric. This
      # is the historical `:auto` behavior, and degrading to it is far safer
      # than a TypeError or divide-by-zero crashing the puma master fleet-wide
      # at boot.
      memory_inputs_usable =
        total_memory_mb &&
        per_worker_mb.is_a?(Numeric) && per_worker_mb.positive? &&
        headroom.is_a?(Numeric) && headroom < 1
      return cpu_workers unless memory_inputs_usable

      memory_workers = (total_memory_mb * (1.0 - headroom) / per_worker_mb).floor
      # Floor at 1 (endless-range clamp); .min already caps at cpu_workers.
      [cpu_workers, memory_workers].min.clamp(1..)
    end

    # Total system RAM in MB from /proc/meminfo. This is Linux-specific, which
    # is fine: every managed environment where clustered puma runs is Linux.
    # On other hosts -- notably macOS dev -- /proc is absent, this returns nil,
    # and compute() falls back to CPU-only sizing. We deliberately don't add a
    # sysctl/other reader: dev runs single mode (dashboard_workers: 0), which
    # short-circuits before the memory budget, and clustered puma on a
    # non-Linux host is served fine by CPU-based sizing.
    def self.total_memory_mb
      return nil unless File.readable?(MEMINFO)

      line = File.foreach(MEMINFO).find {|l| l.start_with?('MemTotal:')}
      return nil unless line

      kb = line.split[1].to_i
      kb.zero? ? nil : kb / 1024
    end
  end
end
