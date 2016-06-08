Then /^the hint lightbulb shows (\d*) hints available$/ do |hint_count|
  steps %{
    Then element "#lightbulb" is visible
    And element "#hintCount" is visible
    And element "#hintCount" has text "#{hint_count}"
  }
end

Then /^the hint lightbulb shows no hints available$/ do
  steps <<-STEPS
    Then element "#lightbulb" is visible
    And element "#hintCount" does not exist
  STEPS
end

When /^I wait for the hint image to load$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: DEFAULT_WAIT_TIMEOUT)
  wait.until { @browser.execute_script("return $('.qtip img').prop('complete');") }
end

When /^I view the next authored hint$/ do
  steps <<-STEPS
    When I press "prompt-table"
    And I wait to see "#hint-button"
    And I press "hint-button"
    And I wait to see ".qtip"
    And I wait for 1 seconds
  STEPS
end

When /^I view the instructions and old hints$/ do
  steps <<-STEPS
    When I press "prompt-table"
    And I wait to see ".instructions-content"
  STEPS
end
