require_relative '../test_helper'
require 'cdo/app_server_metrics'

class AppServerMetricsTest < Minitest::Test
  include Rack::Test::Methods
  TCP_LISTENER = '0.0.0.0:0000'.freeze
  SOCKET_LISTENER = '/tmp/sock'.freeze

  # Make sure we don't leak metrics to other tests.
  def teardown
    Cdo::Metrics.flush!
  end

  def app
    ok = lambda do |_|
      @app.collect_metrics
      [200, {'Content-Type' => 'text/plain'}, ['OK']]
    end

    @app = Rack::Builder.app do
      use Cdo::AppServerMetrics,
        interval: 0,
        listeners: [TCP_LISTENER, SOCKET_LISTENER]
      run ok
    end
  end

  def expect_metrics(*metrics)
    @sequence ||= sequence('metrics')
    metrics.each do |name, value|
      Cdo::Metrics.expects(:put).with(
        "App Server", name, value, {}, {storage_resolution: 1, unit: 'Count'}
      ).in_sequence(@sequence)
    end
  end

  def test_app_server_metrics
    Raindrops::Linux.expects(:tcp_listener_stats).
      with([TCP_LISTENER]).times(2).
      returns(
        {TCP_LISTENER => Raindrops::ListenStats.new(1, 2)},
        {TCP_LISTENER => Raindrops::ListenStats.new(3, 4)},
      )
    Raindrops::Linux.expects(:unix_listener_stats).
      with([SOCKET_LISTENER]).times(2).
      returns({SOCKET_LISTENER => Raindrops::ListenStats.new(0, 0)})

    expect_metrics(
      [:active, 1],
      [:queued, 2],
      [:calling, 1],
      [:active, 3],
      [:queued, 4],
      [:calling, 1]
    )

    get '/'
    get '/'
  end

  # We want to test functionality within AppServerMetrics that depends on a
  # concurrent task. This simple Observer class will let us block until that
  # task has executed at least once.
  #
  # See https://www.rubydoc.info/gems/concurrent-ruby/1.2.3/Concurrent/Concern/Observable
  class TaskExecutionObserver
    def initialize
      @task_executed = Concurrent::Event.new
    end

    def update(time, result, ex)
      @task_executed.set
    end

    def wait_until_task_executed
      @task_executed.wait(1)
    end
  end

  def test_reporting_task
    # Note: this test only passes on Linux systems, since it relies on Raindrops reading from /proc/net/unix.
    skip "Skip on non-Linux system" unless File.file? Raindrops::Linux::PROC_NET_UNIX_ARGS.first

    listener = Cdo::AppServerMetrics.new(nil,
      interval: 0.01,
      listeners: [TCP_LISTENER, SOCKET_LISTENER]
    )
    observer = TaskExecutionObserver.new
    task = listener.spawn_reporting_task
    task.add_observer(observer)
    Cdo::Metrics.expects(:put).at_least(1)
    observer.wait_until_task_executed
  ensure
    listener&.shutdown
    task.wait_for_termination(1)

    # Because it's possible for a thread spawned by the task prior to
    # termination to execute even after wait_for_termination has returned, we
    # delay for a couple extra intervals to ensure that this test's threads
    # will not interefere with test_app_server_metrics
    sleep 0.02
  end
end
