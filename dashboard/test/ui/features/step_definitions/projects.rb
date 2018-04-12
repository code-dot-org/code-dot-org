Then /^I open the project share dialog$/ do
  steps <<-STEPS
    Then I click selector ".project_share"
    And I wait to see a dialog titled "Share your project"
  STEPS
end

Then /^I publish the project from the share dialog$/ do
  steps <<-STEPS
    And I click selector "#share-dialog-publish-button"
    And I wait to see a dialog containing text "Publish to Public Gallery"
    And element "#x-close" is visible
    And element "#publish-dialog-publish-button" is visible
    And I click selector "#publish-dialog-publish-button"
    And I wait for the dialog to close
  STEPS
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
