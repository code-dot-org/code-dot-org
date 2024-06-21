Given /^there is a pilot called "([^"]*)"$/ do |pilot_name|
  # Create a pilot
  browser_request(
    url: '/api/test/create_pilot',
    method: 'POST',
    body: {pilot_name: pilot_name}
  )
end

And /^I add the current user to the "([^"]*)" pilot$/ do |pilot_name|
  # Use the pilot URL as the logged in user to add themselves
  # to the pilot
  steps <<-STEPS
    Given I am on "http://studio.code.org/experiments/set_single_user_experiment/#{pilot_name}"
  STEPS
end

And /^I add the current user to the "([^"]*)" single user experiment$/ do |experiment_name|
  browser_request(
    url: '/api/test/set_single_user_experiment',
    method: 'POST',
    body: {experiment_name: experiment_name}
  )
end

And /^I add the current user to the "([^"]*)" single section experiment for the "([^"]*)" course$/ do |experiment_name, script_name|
  browser_request(
    url: '/api/test/set_single_section_experiment',
    method: 'POST',
    body: {experiment_name: experiment_name, script_name: script_name}
  )
end
