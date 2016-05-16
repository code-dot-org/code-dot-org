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
  steps 'Given I create a student named "TestStudent"'
end

After('@as_student') do
  steps 'When I sign out'
end
