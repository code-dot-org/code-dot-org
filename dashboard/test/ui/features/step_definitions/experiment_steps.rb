When /^I enable the "([^"]*)" course experiment$/ do |experiment_name|
  steps <<-STEPS
    Given I am on "http://studio.code.org/experiments/set_course_experiment/#{experiment_name}"
    And I get redirected to "/" via "dashboard"
    And I get redirected to "/home" via "dashboard"
    And I wait to see ".alert-success"
    Then element ".alert-success" contains text "You have successfully joined the experiment"
  STEPS
end

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
