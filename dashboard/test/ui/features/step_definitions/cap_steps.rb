# Helper steps for CAP (Child Account Policy)

Given /^CPA all user lockout phase( starts at "(.*)")?$/ do |start_time|
  start_time = start_time ? DateTime.parse(start_time).utc : DateTime.parse('2024-07-01T00:00:00MDT')

  @cap_start_date = start_time.ago(1.year)
  @cap_lockout_date = start_time
  mock_dcdo('cap_CO_start_date_override', @cap_start_date.iso8601)
  mock_dcdo('cap_CO_lockout_date_override', @cap_lockout_date.iso8601)
end
