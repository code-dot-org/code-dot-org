Before('@as_student') do
  steps "Given I create a student named \"Student #{rand(100000)}\""
end

Before('@as_young_student') do
  steps "Given I create a young student named \"Student #{rand(100000)}\""
end

Before('@as_taught_student') do
  steps "Given I create a teacher-associated student named \"Student #{rand(100000)}\""
end

Before('@as_authorized_taught_student') do
  steps "Given I create an authorized teacher-associated student named \"Student #{rand(100000)}\""
end

Before('@as_teacher') do
  steps 'Given I am a teacher'
end

# Add After hook as the last one, which results in it being run before
# sign-out steps etc. change the page the browser is currently on.
After do
  check_window_for_js_errors('after scenario')
end

Around do |_, block|
  block.call
rescue Selenium::WebDriver::Error::TimeOutError => e
  check_window_for_js_errors('after timeout')
  raise e
end
