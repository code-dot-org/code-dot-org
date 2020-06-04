require 'dynamic_config/dcdo'

# The "view more" links in the public project gallery for App Lab and Game Lab
# are controlled by DCDO so we can quickly hide them if there are
# inappropriate projects. This lets us test "view more" link
# visibility without updating the tests every time we toggle the flag.
And(/^I confirm correct visibility of view more links$/) do
  dcdo_flag = DCDO.get('image_moderation', {})['limited_project_gallery']
  hidden_view_more_links = dcdo_flag.nil? ? true : dcdo_flag
  if hidden_view_more_links
    steps %Q{
      And the project gallery contains 7 view more links
      And element ".ui-project-app-type-area:eq(2)" contains text "App Lab"
      And element ".ui-project-app-type-area:eq(2)" does not contain text "View more"
      And element ".ui-project-app-type-area:eq(1)" contains text "Game Lab"
      And element ".ui-project-app-type-area:eq(1)" does not contain text "View more"
    }
  else
    steps %Q{
      And the project gallery contains 9 view more links
      And element ".ui-project-app-type-area:eq(2)" contains text "View more App Lab projects"
      And element ".ui-project-app-type-area:eq(1)" contains text "View more Game Lab projects"
    }
  end
end

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
  steps %Q{
    Then I am on "http://studio.code.org/projects/#{project_type}/new"
    And I get redirected to "/projects/#{project_type}/([^\/]*?)/edit" via "dashboard"
    And I wait for the page to fully load
    And element "#runButton" is visible
    And element ".project_updated_at" eventually contains text "Saved"
    And I click selector ".project_edit"
    And I type "#{name}" into "input.project_name"
    And I click selector ".project_save"
    And I wait until element ".project_edit" is visible
    And I press "#runButton" using jQuery
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
  }
end

Then(/^I report abuse on the project$/) do
  steps %Q{
    Then I switch tabs
    Then I wait until current URL contains "report_abuse"
    And I wait until element "#uitest-email" is visible
    And I type "abuse_reporter@school.edu" into "#uitest-email"
    And I select the "Other" option in dropdown "uitest-abuse-type"
    And I type "I just don't like it." into "#uitest-abuse-detail"
    Then I click selector "#uitest-submit-report-abuse" once I see it
    Then I wait until current URL contains "support.code.org"
    Then I switch tabs
  }
end

Then(/^I publish the project$/) do
  steps %Q{
    Given I open the project share dialog
    And the project is unpublished
    When I publish the project from the share dialog
  }
end

Then /^I open the project share dialog$/ do
  steps <<-STEPS
    Then I click selector ".project_share"
    And I wait to see a dialog titled "Share your project"
  STEPS
end

Then /^I publish the project from the share dialog$/ do
  steps <<-STEPS
    And I click selector "#share-dialog-publish-button"
    Then I publish the project from the publish to gallery dialog
  STEPS
end

Then /^I publish the project from the personal projects table publish button$/ do
  steps <<-STEPS
    And I wait until element ".ui-personal-projects-publish-button" is visible
    Then I click selector ".ui-personal-projects-publish-button"
    Then I publish the project from the publish to gallery dialog
    And I wait until element ".ui-personal-projects-unpublish-button" is visible
  STEPS
end

Then /^I publish the project from the publish to gallery dialog$/ do
  steps <<-STEPS
    And I wait to see a publish dialog with title containing "Publish to Public Gallery"
    And element "#publish-dialog-publish-button" is visible
    And I click selector "#publish-dialog-publish-button"
    And I wait for the dialog to close
  STEPS
end

Then /^I navigate to the public gallery via the gallery switcher$/ do
  steps <<-STEPS
    Then I click selector "#uitest-gallery-switcher div:contains(Public Projects)"
    Then check that I am on "http://studio.code.org/projects/public"
    And I wait until element "#uitest-public-projects" is visible
    And element "#uitest-personal-projects" is not visible
  STEPS
end

Then /^I navigate to the personal gallery via the gallery switcher$/ do
  steps <<-STEPS
    Then I click selector "#uitest-gallery-switcher div:contains(My Projects)"
    Then check that I am on "http://studio.code.org/projects"
    And I wait until element "#uitest-personal-projects" is visible
    And element "#uitest-public-projects" is not visible
  STEPS
end

Then /^I wait to see a publish dialog with title containing "((?:[^"\\]|\\.)*)"$/ do |expected_text|
  steps %{
    Then I wait to see ".publish-dialog-title"
    And element ".publish-dialog-title" contains text "#{expected_text}"
  }
end

Then /^I unpublish the project from the share dialog$/ do
  steps <<-STEPS
    Then I click selector "#share-dialog-unpublish-button"
    And I wait for the dialog to close
  STEPS
end

Then /^the project is (un)?published/ do |negation|
  published = negation.nil?
  expect(element_visible?("#share-dialog-publish-button")).to eq(!published)
  expect(element_visible?("#share-dialog-unpublish-button")).to eq(published)
end

Then /^the project cannot be published$/ do
  expect(element_visible?("#share-dialog-publish-button")).to eq(false)
  expect(element_visible?("#share-dialog-unpublish-button")).to eq(false)
end

Then /^the project can be published$/ do
  expect(element_visible?("#share-dialog-publish-button")).to eq(true)
end

Then /^I reload the project page/ do
  steps <<-STEPS
    And I reload the page
    And I wait for the page to fully load
    And element ".project_updated_at" eventually contains text "Saved"
  STEPS
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
