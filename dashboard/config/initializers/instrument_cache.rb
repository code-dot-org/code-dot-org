# Track hit rate per cache store.
ActiveSupport::Notifications.subscribe "cache_read.active_support" do |event|
  Cdo::Metrics.put(
    'Infrastructure',
    'ActiveSupportCacheRead',
    1,
    {
      Environment: CDO.rack_env,
      Hit: event.payload[:hit].to_s,
      Store: event.payload[:store]
    }
  )
end

# Track total amount of data being read out of each cache cache, mostly to get
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
          Environment: CDO.rack_env,
          Store: self.class.name
        }
      )
      result
    end
  end
end

Rails.application.config.before_configuration do
  Rails.cache.class.prepend(Cdo::LogCacheBytesRead) unless Rails.cache.class <= Cdo::LogCacheBytesRead
end
