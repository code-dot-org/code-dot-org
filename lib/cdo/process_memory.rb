require 'cdo'

module Cdo
  # Lightweight process-memory snapshots for diagnostics.
  #
  # On Linux, this reads /proc/$pid/status and /proc/$pid/smaps_rollup and returns
  # selected values in kilobytes. On macOS and other systems without those procfs
  # files, it returns an empty hash. Missing or unreadable procfs files are
  # treated as unavailable metrics, not as errors.
  module ProcessMemory
    STATUS_FIELDS = {
      'VmRSS' => :proc_vm_rss_kb,
      'VmHWM' => :proc_vm_hwm_kb,
      'VmSize' => :proc_vm_size_kb,
      'VmData' => :proc_vm_data_kb,
      'VmSwap' => :proc_vm_swap_kb,
      'Threads' => :proc_threads
    }.freeze

    SMAPS_ROLLUP_FIELDS = {
      'Rss' => :smaps_rss_kb,
      'Pss' => :smaps_pss_kb,
      'Private_Clean' => :smaps_private_clean_kb,
      'Private_Dirty' => :smaps_private_dirty_kb,
      'Shared_Clean' => :smaps_shared_clean_kb,
      'Shared_Dirty' => :smaps_shared_dirty_kb
    }.freeze

    def self.snapshot_kb(pid: Process.pid)
      snapshot = {}
      read_kb_fields("/proc/#{pid}/status", STATUS_FIELDS, snapshot)
      read_kb_fields("/proc/#{pid}/smaps_rollup", SMAPS_ROLLUP_FIELDS, snapshot)
      snapshot
    end

    def self.log_snapshot(event, fields: {}, pid: Process.pid)
      metrics = fields.merge(snapshot_kb(pid: pid))
      CDO.log.info(format_log(event, metrics))
      metrics
    end

    def self.format_log(event, fields)
      ["event=#{event}", *fields.map {|key, value| "#{key}=#{value}"}].join(' ')
    end

    def self.read_kb_fields(path, field_names, snapshot)
      return snapshot unless File.readable?(path)

      File.foreach(path) do |line|
        key, value = line.split(':', 2)
        metric_name = field_names[key]
        snapshot[metric_name] = value.to_i if metric_name
      end

      snapshot
    rescue Errno::ENOENT, Errno::EACCES
      snapshot
    end
    private_class_method :format_log
    private_class_method :read_kb_fields
  end
end
