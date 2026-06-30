require_relative '../test_helper'
require 'cdo/app_server_hooks'
require 'cdo/worker_memory_collector'
require 'cdo/process_memory'
require 'cdo/statsig'

class AppServerHooksTest < Minitest::Test
  def setup
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:rack_env?).with(:production).returns(true)
    CDO.stubs(:test_system?).returns(false)
    CDO.stubs(:rack_env).returns(:production)
    CDO.stubs(:dashboard_hostname).returns('test.example.net')
    Cdo::Metrics.stubs(:put)
    Cdo::StatsigInitializer.stubs(:init)
  end

  def test_worker_memory_collector_started_with_host_only
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 120})

    collector = mock('collector')
    collector.expects(:start)
    Cdo::WorkerMemoryCollector.expects(:new).with(
      namespace: 'App Server',
      interval: 120,
      resolution: 120,
      dimensions: {Host: 'test.example.net'}
    ).returns(collector)

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 3)
  end

  def test_worker_memory_collector_includes_instance_id_when_per_instance
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns(
      {'interval_seconds' => 60, 'per_instance' => true}
    )
    AWS::EC2.stubs(:instance_id).returns('i-abc123')

    collector = mock('collector')
    collector.expects(:start)
    Cdo::WorkerMemoryCollector.expects(:new).with(
      namespace: 'App Server',
      interval: 60,
      resolution: 60,
      dimensions: {
        Host: 'test.example.net',
        WorkerIndex: '0',
        InstanceId: 'i-abc123'
      }
    ).returns(collector)

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end

  def test_worker_memory_collector_omits_instance_id_and_worker_index_when_imds_unavailable
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns(
      {'interval_seconds' => 60, 'per_instance' => true}
    )
    AWS::EC2.stubs(:instance_id).returns(nil)

    collector = mock('collector')
    collector.expects(:start)
    Cdo::WorkerMemoryCollector.expects(:new).with(
      namespace: 'App Server',
      interval: 60,
      resolution: 60,
      dimensions: {Host: 'test.example.net'}
    ).returns(collector)

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end

  def test_worker_memory_collector_not_started_when_interval_zero
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 0})

    Cdo::WorkerMemoryCollector.expects(:new).never

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end

  def test_worker_memory_collector_not_started_when_dcdo_empty
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({})

    Cdo::WorkerMemoryCollector.expects(:new).never

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end

  def test_worker_memory_collector_not_started_in_development
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:test_system?).returns(false)
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 60})

    Cdo::WorkerMemoryCollector.expects(:new).never

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end

  def test_prefork_memory_metric_published_with_host_only
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 120})
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns(proc_vm_rss_kb: 1_800_000)

    Cdo::Metrics.expects(:put).with('App Server', 'PreforkRssKb', 1_800_000, {Host: 'test.example.net'})

    Cdo::AppServerHooks.send(:publish_prefork_memory_metric)
  end

  def test_prefork_memory_metric_includes_instance_id_when_per_instance
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 60, 'per_instance' => true})
    AWS::EC2.stubs(:instance_id).returns('i-abc123')
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns(proc_vm_rss_kb: 1_800_000)

    Cdo::Metrics.expects(:put).with(
      'App Server', 'PreforkRssKb', 1_800_000, {Host: 'test.example.net', InstanceId: 'i-abc123'}
    )

    Cdo::AppServerHooks.send(:publish_prefork_memory_metric)
  end

  def test_prefork_memory_metric_omits_instance_id_when_imds_unavailable
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 60, 'per_instance' => true})
    AWS::EC2.stubs(:instance_id).returns(nil)
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns(proc_vm_rss_kb: 1_800_000)

    Cdo::Metrics.expects(:put).with('App Server', 'PreforkRssKb', 1_800_000, {Host: 'test.example.net'})

    Cdo::AppServerHooks.send(:publish_prefork_memory_metric)
  end

  def test_prefork_memory_metric_not_published_when_interval_zero
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 0})

    Cdo::Metrics.expects(:put).never

    Cdo::AppServerHooks.send(:publish_prefork_memory_metric)
  end

  def test_prefork_memory_metric_not_published_in_development
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:test_system?).returns(false)
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 60})

    Cdo::Metrics.expects(:put).never

    Cdo::AppServerHooks.send(:publish_prefork_memory_metric)
  end

  def test_prefork_memory_metric_omits_value_when_rss_unavailable
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 60})
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns({})

    Cdo::Metrics.expects(:put).never

    Cdo::AppServerHooks.send(:publish_prefork_memory_metric)
  end

  def test_prefork_memory_metric_swallows_errors
    DCDO.stubs(:get).with('worker_memory_metrics', {}).returns({'interval_seconds' => 60})
    Cdo::ProcessMemory.stubs(:snapshot_kb).returns(proc_vm_rss_kb: 1_800_000)
    Cdo::Metrics.stubs(:put).raises(StandardError, 'cloudwatch unreachable')

    logger = mock('logger')
    logger.expects(:warn).with(regexp_matches(/puma_prefork_memory_metric_failed/))
    CDO.stubs(:log).returns(logger)

    Cdo::AppServerHooks.send(:publish_prefork_memory_metric)
  end
end
