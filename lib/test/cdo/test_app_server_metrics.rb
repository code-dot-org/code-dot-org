require_relative '../test_helper'
require 'cdo/app_server_metrics'

class AppServerMetricsTest < Minitest::Test
  include Rack::Test::Methods
  TCP_LISTENER = '0.0.0.0:0000'.freeze
  SOCKET_LISTENER = '/tmp/sock'.freeze

  def app
    ok = ->(_) do
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
      Cdo::Metrics.expects(:put).with("App Server/#{name}", value, {}, {storage_resolution: 1, unit: 'Count'}).in_sequence(@sequence)
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

  def test_reporting_task
    # Note: this test only passes on Linux systems, since it relies on Raindrops reading from /proc/net/unix.
    skip "Skip on non-Linux system" unless File.file? Raindrops::Linux::PROC_NET_UNIX_ARGS.first

    listener = Cdo::AppServerMetrics.new(nil,
      interval: 0.1,
      listeners: [TCP_LISTENER, SOCKET_LISTENER]
    )
    listener.spawn_reporting_task
    Cdo::Metrics.expects(:put).at_least(1)
    sleep 1
  ensure
    listener && listener.shutdown
  end
end
