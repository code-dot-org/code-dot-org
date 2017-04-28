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
  wait.until {@browser.execute_script("return $('.csf-top-instructions img').prop('complete');")}
end

When /^I view the next authored hint$/ do
  steps <<-STEPS
    When I press "lightbulb"
    And I wait until element ".csf-top-instructions button:contains(Yes)" is visible
    And I click selector ".csf-top-instructions button:contains(Yes)"
  STEPS
end
