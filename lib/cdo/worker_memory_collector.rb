# frozen_string_literal: true

require 'cdo/metric_collector'
require 'cdo/process_memory'

module Cdo
  class WorkerMemoryCollector < MetricCollector
    # From /proc/self/smaps_rollup and /proc/self/status:
    PROCFS_METRICS = {
      smaps_pss_kb: 'WorkerPssKb',           # Proportional Set Size — true RAM cost after CoW accounting
      smaps_private_dirty_kb: 'WorkerPrivateDirtyKb', # Pages dirtied by this worker alone (CoW erosion indicator)
      smaps_shared_clean_kb: 'WorkerSharedCleanKb',   # Still-shared CoW pages; declines as GC dirties them
      proc_vm_rss_kb: 'WorkerRssKb'          # VmRSS — cross-reference for PSS (includes shared pages at full weight)
    }.freeze

    # From GC.stat (Ruby VM internals):
    GC_METRICS = {
      heap_live_slots: 'HeapLiveSlots',       # Live object count — tracks cache fill (Phase 1 growth)
      old_objects: 'OldObjects',              # Tenured objects surviving promotion — determines mark-sweep surface area
      major_gc_count: 'MajorGcCount',         # Full mark-sweep cycles — each one walks old_objects and dirties CoW pages
      heap_allocated_pages: 'HeapAllocatedPages' # Ruby heap page count — geometry of the object heap
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
