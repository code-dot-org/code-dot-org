if rack_env?(:production, :adhoc) || CDO.test_system?
  # Count hits and misses per cache store.
  ActiveSupport::Notifications.subscribe "cache_read.active_support" do |event|
    metric_name = "ActiveSupportCache#{event.payload[:hit] ? 'Hit' : 'Miss'}"
    Cdo::Metrics.put(
      'Infrastructure',
      metric_name,
      1,
      {
        Host: CDO.dashboard_hostname,
        Store: event.payload[:store]
      }
    )
  end
end
