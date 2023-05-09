require_relative '../../deployment'
require 'cdo/slack'
require 'tzinfo'

module InfraProductionTopic
  def self.set_dtp_commit(commit)
    msg = "DTP Status: #{commit} @ #{current_time_pacific}"
    Slack.update_topic 'infra-production', msg
  end

  private_class_method def self.current_time_pacific
    timezone_name = 'US/Pacific'

    timezone = TZInfo::Timezone.get(timezone_name)
    offset_in_seconds = timezone.observed_utc_offset
    offset_in_hours = offset_in_seconds / 3600
    offset = format '%+.2d:00', offset_in_hours

    Time.now.getlocal(offset)
  end
end
