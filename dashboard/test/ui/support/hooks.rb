saw_failure = false

Before('@stop_after_failure') do
  if saw_failure
    fail 'skipping due to seen failure'
  end
end

After('@stop_after_failure') do |scenario|
  if scenario.failed?
    saw_failure = true
  end
end

Before('@as_student') do
  steps 'Given I manually sign in as "TestStudent"'
end

After('@as_student') do
  steps 'When I sign out'
end
