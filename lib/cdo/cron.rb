require 'active_support/time'
require 'chronic'

# Utility functions to generate cron expressions.
module Cdo
  class Cron
    DEFAULT_TIME_ZONE = 'Pacific Time (US & Canada)'.freeze

    # Convert 'weekdays at [time_str]' in specified time zone to UTC cron syntax.
    def self.weekdays_at(time_str, time_zone: DEFAULT_TIME_ZONE)
      Time.use_zone(time_zone) do
        Chronic.time_class = Time.zone
        times = DateTime.now.
                all_week.
                select(&:on_weekday?).
                map {|day| Chronic.parse(time_str, now: day)}.
                map(&:utc)
        day_names = times.map {|day| day.strftime('%a').upcase}
        "0 #{times.first.hour} * * #{day_names.first}-#{day_names.last}"
      end
    end

    # Convert 'weekly at [time_str]' in specified time zone to UTC cron syntax.
    def self.weekly_at(time_str, time_zone: DEFAULT_TIME_ZONE)
      Time.use_zone(time_zone) do
        Chronic.time_class = Time.zone
        time = Chronic.parse(time_str).utc
        day_name = time.strftime('%a').upcase
        "#{time.min} #{time.hour} * * #{day_name}"
      end
    end
  end
end
