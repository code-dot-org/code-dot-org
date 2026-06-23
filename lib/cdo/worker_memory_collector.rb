# frozen_string_literal: true

require 'cdo/metric_collector'
require 'cdo/process_memory'

module Cdo
  class WorkerMemoryCollector < MetricCollector
    PROCFS_METRICS = {
      smaps_pss_kb: 'WorkerPssKb',
      smaps_private_dirty_kb: 'WorkerPrivateDirtyKb',
      smaps_shared_clean_kb: 'WorkerSharedCleanKb',
      proc_vm_rss_kb: 'WorkerRssKb'
    }.freeze

    GC_METRICS = {
      heap_live_slots: 'HeapLiveSlots',
      old_objects: 'OldObjects',
      major_gc_count: 'MajorGcCount',
      heap_allocated_pages: 'HeapAllocatedPages'
    }.freeze

    def snapshot
      metrics = {}

      ProcessMemory.snapshot_kb.each do |key, value|
        name = PROCFS_METRICS[key]
        metrics[name] = value if name && !value.nil?
      end

      gc = GC.stat
      GC_METRICS.each do |key, name|
        value = gc[key]
        metrics[name] = value unless value.nil?
      end

      metrics
    end
  end
end
