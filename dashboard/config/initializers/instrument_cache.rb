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

  # Track total amount of data being read out of each cache, mostly to get
  # insight into what it would take to host the Rails cache on a networked server
  # (ie, redis). We can't do this with ActiveSupport instrumentation, because
  # none of the available events let us inspect the returned value itself.
  #
  # TODO infra: remove this module once we've finished investigating our runaway
  # memory usage issues. The hit rate tracker above might be useful enough to
  # keep, but this is too case-specific and too much of a hack for long-term use.
  module Cdo
    module LogCacheBytesRead
      private def read_entry(key, **options)
        result = super
        Cdo::Metrics.put(
          'Infrastructure',
          'ActiveSupportCacheBytesRead',
          result.try(:bytesize) || 0,
          {
            Host: CDO.dashboard_hostname,
            Store: self.class.name
          }
        )
        result
      end
    end
  end

  Rails.application.config.before_configuration do
    ActiveSupport::Cache::Store.prepend(Cdo::LogCacheBytesRead) unless ActiveSupport::Cache::Store <= Cdo::LogCacheBytesRead
  end
end
