require_relative '../../deployment'
require 'cdo/slack'
require 'tzinfo'

module InfraTestTopic
  def self.set_green_commit(commit)
    msg = "#{commit} is :greenbeer: @ #{current_time_pacific}"
    Slack.update_topic 'infra-test', msg
  end

  # @return [String | nil] Returns the commit specified as :greenbeer: in the Slack#infra-test
  #   topic (if one exists) or nil.
  def self.green_commit
    current_topic = Slack.get_topic('infra-test')
    return nil unless current_topic =~ /:greenbeer:/
    current_topic[0..7]
  end

  private_class_method def self.current_time_pacific
    timezone_name = 'US/Pacific'

    timezone = TZInfo::Timezone.get(timezone_name)
    offset_in_hours = timezone.current_period.utc_total_offset_rational.numerator
    offset = format '%+.2d:00', offset_in_hours

    Time.now.getlocal(offset)
  end
end
