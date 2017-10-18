When /^I enable the "([^"]*)" course experiment$/ do |experiment_name|
  steps <<-STEPS
    Given I am on "http://studio.code.org/experiments/set_course_experiment/#{experiment_name}"
    And I get redirected to "/" via "dashboard"
    And I get redirected to "/home" via "dashboard"
    And I wait to see ".alert-success"
    Then element ".alert-success" contains text "You have successfully joined the experiment"
  STEPS
end

When /^I wait for the pegasus and dashboard experiment caches to expire$/ do
  steps 'And I wait for 61 seconds'
end
