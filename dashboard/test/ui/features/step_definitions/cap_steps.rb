# Helper steps for CAP (Child Account Policy)

Given /^CPA new user lockout phase( starts at "(.*)")?$/ do |start_time|
  start_time = start_time ? DateTime.parse(start_time).utc : DateTime.now.utc

  mock_dcdo(
    'cpa_schedule',
    {
      cpa_new_user_lockout: start_time,
      cpa_all_user_lockout: start_time.since(1.year),
    }
  )
end

Given /^CPA all user lockout phase( starts at "(.*)")?$/ do |start_time|
  start_time = start_time ? DateTime.parse(start_time).utc : DateTime.now.utc

  mock_dcdo(
    'cpa_schedule',
    {
      cpa_new_user_lockout: start_time.ago(1.year),
      cpa_all_user_lockout: start_time,
    }
  )
end
