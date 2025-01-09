module Policies::ChildAccount::StatePolicies
  def self.state_policies
    # The individual US State child account policy configuration
    # name: the name of the policy
    # grace_period_duration: the duration of the grace period in seconds.
    # max_age: the oldest age of the child at which this policy applies.
    # lockout_date: the date at which we will begin to lockout all CPA users who
    # are not in compliance with the policy.
    # start_date: the date on which this policy first went into effect.
    policies = {
      'CO' => {
        name: 'CPA',
        max_age: 12,
        grace_period_duration: 14.days.seconds,
        lockout_date: DateTime.parse('2024-07-01T00:00:00MDT'),
        start_date: DateTime.parse('2023-07-05T23:15:00+00:00'),
      },
      'DE' => {
        name: 'DPDPA',
        max_age: 12,
        grace_period_duration: 14.days.seconds,
        lockout_date: DateTime.parse('2025-01-06T00:00:00-05:00'),
        start_date: DateTime.parse('2025-01-06T00:00:00-05:00'),
      },
    }

    # Override the configured dates for testing purposes
    policies.each_key do |state_code|
      policy = policies[state_code]
      lockout_date_override = DCDO.get("cap_#{state_code}_lockout_date_override", nil)
      policy[:lockout_date] = DateTime.parse(lockout_date_override) if lockout_date_override
      start_date_override = DCDO.get("cap_#{state_code}_start_date_override", nil)
      policy[:start_date] = DateTime.parse(start_date_override) if start_date_override
    end
  end

  def self.state_policy(user)
    # If the country_code is not set, then us_state value was inherited
    # from the teacher and we don't trust it.
    return unless user.country_code
    return unless user.us_state
    state_policies[user.us_state]
  end
end
