module PagerDuty
  PAGERDUTY_TOKEN = CDO.pagerduty_token.freeze

  POLICIES = [
    LIVE_SITE = 'Live Site Issues'.freeze
  ].freeze

  # @param escalation_policy_name [String] The name of the escalation policy.
  # @raise [ArgumentError] If the escalation policy cannot be found.
  # @return [String] The PagerDuty ID for the escalation policy.
  def self.escalation_policy_id(escalation_policy_name)
    response = `curl --silent -H "Content-type: application/json" -H "Authorization: Token token=#{PAGERDUTY_TOKEN}" -H "Accept: application/vnd.pagerduty+json;version=2" -X GET -G "https://api.pagerduty.com/escalation_policies"`
    escalation_policies = JSON.parse(response)['escalation_policies']
    escalation_policy = escalation_policies.find do |policy|
      policy['summary'] == escalation_policy_name
    end
    unless escalation_policy
      raise "Escalation policy #{escalation_policy_name} not found"
    end
    escalation_policy['id']
  end

  # @param escalation_policy_name [String] The policy to fetch the oncall for.
  # @param escalation_level [Integer] The level to fetch the oncall for.
  # @return [String] The email address of the current oncall.
  def self.on_call(escalation_policy_name = LIVE_SITE, escalation_level = 1)
    # Get the PagerDuty escalation policy ID for the escalation policy.
    escalation_policy_id = escalation_policy_id escalation_policy_name

    # Get the PagerDuty user that is the oncall.
    response = `curl --silent -H "Content-type: application/json" -H "Authorization: Token token=#{PAGERDUTY_TOKEN}" -H "Accept: application/vnd.pagerduty+json;version=2" -X GET -G "https://api.pagerduty.com/oncalls?escalation_policy_ids%5B%5D=#{escalation_policy_id}"`
    on_calls = JSON.parse(response)['oncalls']
    on_call = on_calls.find do |victim|
      victim['escalation_policy']['summary'] == escalation_policy_name &&
        victim['escalation_level'] == escalation_level
    end
    user_url = on_call['user']['self']

    # Get the email address for the PagerDuty user.
    response = `curl --silent -H "Content-type: application/json" -H "Authorization: Token token=#{PAGERDUTY_TOKEN}" -H "Accept: application/vnd.pagerduty+json;version=2" -X GET -G #{user_url}`
    user = JSON.parse(response)['user']
    user['email']
  end
end
