require_relative '../../deployment'
require 'cdo/slack'
require 'tzinfo'

module InfraTestTopic
  def self.set_green_commit(commit)
    msg = "#{commit} is :greenbeer: :robot_face: @ #{current_time_pacific}"
    Slack.update_topic 'infra-test', msg
  end

  private_class_method def self.current_time_pacific
    timezone_name = 'US/Pacific'

    timezone = TZInfo::Timezone.get(timezone_name)
    offset_in_hours = timezone.current_period.utc_total_offset_rational.numerator
    offset = format '%+.2d:00', offset_in_hours

    Time.now.getlocal(offset)
  end
end
