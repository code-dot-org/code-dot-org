# Helper steps for CAP (Child Account Policy)

Given /^CPA new user lockout phase( starts at "(.*)")?$/ do |start_time|
  start_time = start_time ? DateTime.parse(start_time).utc : DateTime.now.utc

  @cap_start_date = start_time
  @cap_lockout_date = start_time.since(1.year)
  mock_dcdo('cap_CO_start_date_override', @cap_start_date.iso8601)
  mock_dcdo('cap_CO_lockout_date_override', @cap_lockout_date.since(1.year).iso8601)
end

Given /^CPA all user lockout phase( starts at "(.*)")?$/ do |start_time|
  start_time = start_time ? DateTime.parse(start_time).utc : DateTime.now.utc

  @cap_start_date = start_time.ago(1.year)
  @cap_lockout_date = start_time
  mock_dcdo('cap_CO_start_date_override', @cap_start_date.ago(1.year).iso8601)
  mock_dcdo('cap_CO_lockout_date_override', @cap_lockout_date.iso8601)
end
