require_relative '../test_helper'
require 'cdo/app_server_hooks'
require 'cdo/worker_memory_collector'

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

  def test_worker_memory_collector_started_when_dcdo_enabled
    DCDO.stubs(:get).with('publish_worker_memory_metrics', false).returns(true)

    collector = mock('collector')
    collector.expects(:start)
    Cdo::WorkerMemoryCollector.expects(:new).with(
      namespace: 'App Server',
      interval: 60,
      resolution: 60,
      dimensions: {
        Environment: :production,
        Host: 'test.example.net',
        WorkerIndex: '3'
      }
    ).returns(collector)

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 3)
  end

  def test_worker_memory_collector_not_started_when_dcdo_disabled
    DCDO.stubs(:get).with('publish_worker_memory_metrics', false).returns(false)

    Cdo::WorkerMemoryCollector.expects(:new).never

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end

  def test_worker_memory_collector_not_started_when_dcdo_unset
    DCDO.stubs(:get).with('publish_worker_memory_metrics', false).returns(false)

    Cdo::WorkerMemoryCollector.expects(:new).never

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end

  def test_worker_memory_collector_not_started_in_development
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:test_system?).returns(false)
    DCDO.stubs(:get).with('publish_worker_memory_metrics', false).returns(true)

    Cdo::WorkerMemoryCollector.expects(:new).never

    Cdo::AppServerHooks.before_worker_boot(host: 'test.example.net', worker_index: 0)
  end
end
