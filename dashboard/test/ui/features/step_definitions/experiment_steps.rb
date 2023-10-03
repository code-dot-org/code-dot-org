When /^I enable the "([^"]*)" course experiment$/ do |experiment_name|
  steps <<-STEPS
    Given I am on "http://studio.code.org/experiments/set_course_experiment/#{experiment_name}"
    And I get redirected to "/" via "dashboard"
    And I get redirected to "/home" via "dashboard"
    And I wait to see ".alert-success"
    Then element ".alert-success" contains text "You have successfully joined the experiment"
  STEPS
end

Given /^An administrator logs in and creates the pilot "([^"]*)"$/ do |pilot_name|
  # Ensure an admin exists
  admin = admin_user

  # Log in as the admin and set up the pilot
  steps <<-STEPS
    Given I sign in as "#{admin}"
    Given I am on "http://studio.code.org/admin/pilots"
    And I take note of the current loaded page
    When I type "#{pilot_name}" into "#pilot_name"
    When I type "#{pilot_name}" into "#pilot_display_name"
    And I press "#pilot_allow_joining_via_url" using jQuery
    And I press "input[name=commit]" using jQuery
    Then I wait until I am on a different page than I noted before
  STEPS
end

Given /^I add the current user to the "([^"]*)" pilot$/ do |pilot_name|
  # Use the pilot URL as the logged in user to add themselves
  # to the pilot
  steps <<-STEPS
    Given I am on "http://studio.code.org/experiments/set_single_user_experiment/#{pilot_name}"
  STEPS
end
