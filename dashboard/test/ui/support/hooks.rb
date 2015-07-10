saw_failure = false

Before('@stop_after_failure') do |scenario|
  if saw_failure
    fail 'skipping due to seen failure'
  end
end

After('@stop_after_failure') do |scenario|
  if scenario.failed?
    saw_failure = true
  end
end
