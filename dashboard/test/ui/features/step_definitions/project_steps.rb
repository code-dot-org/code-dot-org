require 'dynamic_config/dcdo'

And(/^I give user "([^"]*)" project validator permission$/) do |name|
  require_rails_env
  user = User.find_by_email_or_hashed_email(@users[name][:email])
  user.permission = UserPermission::PROJECT_VALIDATOR
  user.save!
end

Then(/^I remove featured projects from the gallery$/) do
  require_rails_env
  FeaturedProject.delete_all
end

Then(/^I scroll the Play Lab gallery section into view$/) do
  wait_short_until {@browser.execute_script('return $(".ui-playlab").length') > 0}
  @browser.execute_script('$(".ui-playlab")[0].scrollIntoView(true)')
end

Then(/^I make a "([^"]*)" project named "([^"]*)"$/) do |project_type, name|
  steps <<~GHERKIN
    Then I am on "http://studio.code.org/projects/#{project_type}/new"
    And I get redirected to "/projects/#{project_type}/([^/]*?)/edit" via "dashboard"
    And I wait for the lab page to fully load
    And element "#runButton" is visible
    And element ".project_updated_at" eventually contains text "Saved"
    And I click selector ".project_edit"
    And I type "#{name}" into "input.project_name"
    And I click selector ".project_save"
    And I wait until element ".project_edit" is visible
    And I press "#runButton" using jQuery
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
  GHERKIN
end

Then(/^I report abuse on the project$/) do
  steps <<~GHERKIN
    Then I switch tabs
    Then I wait until current URL contains "report_abuse"
    And I wait until element "#uitest-abuse-url" is visible
    And I type "abuse_reporter@school.edu" into "#uitest-email" if I see it
    And I select the "Other" option in dropdown "uitest-abuse-type"
    And I type "I just don't like it." into "#uitest-abuse-detail"
    Then I click selector "#uitest-submit-report-abuse" once I see it
    Then I wait until current URL contains "support.code.org"
    Then I switch tabs
  GHERKIN
end

Then /^I navigate to the public gallery via the gallery switcher$/ do
  steps <<-GHERKIN
    Then I click selector "#uitest-gallery-switcher span:contains(Featured Projects)"
    Then check that I am on "http://studio.code.org/projects/public"
    And I wait until element "#uitest-public-projects" is visible
    And element "#uitest-personal-projects" is not visible
  GHERKIN
end

Then /^I navigate to the personal gallery via the gallery switcher$/ do
  steps <<-GHERKIN
    Then I click selector "#uitest-gallery-switcher span:contains(My Projects)"
    Then check that I am on "http://studio.code.org/projects"
    And I wait until element "#uitest-personal-projects" is visible
    And element "#uitest-public-projects" is not visible
  GHERKIN
end

Then /^I reload the project page/ do
  steps <<-GHERKIN
    And I reload the page
    And I wait for the lab page to fully load
    And element ".project_updated_at" eventually contains text "Saved"
  GHERKIN
end

Then /^I set the project version interval to (\d+) seconds?$/ do |seconds|
  code = "window.dashboard.project.__TestInterface.setSourceVersionInterval(#{seconds});"
  @browser.execute_script(code)
end

Then /^the project table contains ([\d]+) (?:row|rows)$/ do |expected_num|
  actual_num = @browser.execute_script("return $('.ui-personal-projects-row').length;")
  expect(actual_num).to eq(expected_num.to_i)
end

Then /^the first project in the table is named "([^"]*)"$/ do |expected_name|
  steps %{
    And I wait until element ".ui-projects-table-project-name" is visible
    And I wait until the first ".ui-projects-table-project-name" contains text "#{expected_name}"
  }
end

Then /^the project gallery contains ([\d]+) project (?:type|types)$/ do |expected_num|
  actual_num = @browser.execute_script("return $('.ui-project-app-type-area').length;")
  expect(actual_num).to eq(expected_num.to_i)
end

Then /^the project gallery contains ([\d]+) view more (?:link|links)$/ do |expected_num|
  actual_num = @browser.execute_script("return $('.viewMoreLink').length;")
  expect(actual_num).to eq(expected_num.to_i)
end

last_shared_url = nil
Then /^I save the share URL$/ do
  wait_short_until {@button = @browser.find_element(id: 'sharing-dialog-copy-button')}
  last_shared_url = @browser.execute_script("return document.getElementById('sharing-dialog-copy-button').value")
end

When /^I open the project share dialog$/ do
  Retryable.retryable(on: RSpec::Expectations::ExpectationNotMetError, sleep: 10, tries: 3) do
    steps <<-GHERKIN
      When I click selector ".project_share"
      And I wait to see a dialog titled "Share your project"
    GHERKIN
  end
end

When /^I navigate to the shared version of my project$/ do
  steps <<-GHERKIN
    When I open the project share dialog
    And I navigate to the share URL
  GHERKIN
end

Then /^I navigate to the share URL$/ do
  steps <<-GHERKIN
    Then I save the share URL
    And I navigate to the last shared URL
  GHERKIN
end

Then /^I navigate to the last shared URL$/ do
  @browser.navigate.to last_shared_url
  wait_for_jquery
end

Then /^I navigate to the last shared URL with a queryparam$/ do
  @browser.navigate.to last_shared_url + '?testid=99999999'
  wait_for_jquery
end

Then /^I enter the last shared URL into input "(.*)"$/ do |selector|
  @browser.execute_script("document.querySelector('#{selector}').value = \"#{last_shared_url}\"")
end

Then /^I wait until initial thumbnail capture is complete$/ do
  wait_until do
    @browser.execute_script('return dashboard.project.__TestInterface.isInitialCaptureComplete();')
  end
end

Then /^I wait for initial project save to complete$/ do
  wait_until do
    @browser.execute_script('return dashboard.project.__TestInterface.isInitialSaveComplete();')
  end
end
