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
        report_count: 2,
        listeners: [TCP_LISTENER, SOCKET_LISTENER]
      run ok
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

    Cdo::Metrics.expects(:push).with do |namespace, data|
      namespace == 'App Server' &&
        data.group_by {|d| d[:metric_name]}.
          map {|k, v| {k => v.map {|x| x[:value]}}} ==
          [
            {active: [1, 3]},
            {queued: [2, 4]},
            {calling: [1, 1]}
          ]
    end

    get '/'
    get '/'
  end

  def test_reporting_task
    listener = Cdo::AppServerMetrics.new(nil,
      interval: 0.1,
      report_count: 2,
      listeners: [TCP_LISTENER, SOCKET_LISTENER]
    )
    listener.spawn_reporting_task
    Cdo::Metrics.expects(:push).at_least(1)
    sleep 0.3
  ensure
    listener && listener.shutdown
  end
end
