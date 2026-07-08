require_relative '../test_helper'
require 'cdo/worker_memory_collector'

class WorkerMemoryCollectorTest < Minitest::Test
  def setup
    @collector = Cdo::WorkerMemoryCollector.new(
      namespace: 'App Server',
      interval: 60,
      resolution: 60,
      dimensions: {
        Environment: 'test',
        Host: 'test.example.net',
        WorkerIndex: '0'
      }
    )
  end

  def teardown
    @collector.shutdown
    Cdo::Metrics.flush!
  end

  def test_snapshot_maps_procfs_and_gc_fields
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns(
      smaps_pss_kb: 3_427_000,
      smaps_private_dirty_kb: 1_200_000,
      smaps_shared_clean_kb: 800_000,
      smaps_shared_dirty_kb: 1_500_000,
      proc_vm_rss_kb: 3_500_000
    )

    GC.stubs(:stat).returns(
      heap_live_slots: 2_700_000,
      old_objects: 1_800_000,
      major_gc_count: 42,
      heap_allocated_pages: 65_000
    )

    expected = {
      'WorkerPssKb' => 3_427_000,
      'WorkerPrivateDirtyKb' => 1_200_000,
      'WorkerSharedCleanKb' => 800_000,
      'WorkerSharedDirtyKb' => 1_500_000,
      'WorkerRssKb' => 3_500_000,
      'HeapLiveSlots' => 2_700_000,
      'OldObjects' => 1_800_000,
      'MajorGcCount' => 42,
      'HeapAllocatedPages' => 65_000
    }

    assert_equal expected, @collector.snapshot
  end

  def test_snapshot_omits_nil_procfs_values
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns({})

    GC.stubs(:stat).returns(
      heap_live_slots: 100,
      old_objects: 50,
      major_gc_count: 1,
      heap_allocated_pages: 10
    )

    result = @collector.snapshot
    refute result.key?('WorkerPssKb')
    refute result.key?('WorkerPrivateDirtyKb')
    refute result.key?('WorkerSharedCleanKb')
    refute result.key?('WorkerSharedDirtyKb')
    refute result.key?('WorkerRssKb')

    assert_equal 100, result['HeapLiveSlots']
    assert_equal 50, result['OldObjects']
    assert_equal 1, result['MajorGcCount']
    assert_equal 10, result['HeapAllocatedPages']
  end

  def test_collect_publishes_all_metrics
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns(
      smaps_pss_kb: 1000,
      proc_vm_rss_kb: 2000
    )

    GC.stubs(:stat).returns(
      heap_live_slots: 500,
      old_objects: 200,
      major_gc_count: 3,
      heap_allocated_pages: 100
    )

    dims = {Environment: 'test', Host: 'test.example.net', WorkerIndex: '0'}

    Cdo::Metrics.expects(:put).with('App Server', 'WorkerPssKb', 1000, dims, storage_resolution: 60)
    Cdo::Metrics.expects(:put).with('App Server', 'WorkerRssKb', 2000, dims, storage_resolution: 60)
    Cdo::Metrics.expects(:put).with('App Server', 'HeapLiveSlots', 500, dims, storage_resolution: 60)
    Cdo::Metrics.expects(:put).with('App Server', 'OldObjects', 200, dims, storage_resolution: 60)
    Cdo::Metrics.expects(:put).with('App Server', 'MajorGcCount', 3, dims, storage_resolution: 60)
    Cdo::Metrics.expects(:put).with('App Server', 'HeapAllocatedPages', 100, dims, storage_resolution: 60)

    @collector.send(:collect)
  end
end
