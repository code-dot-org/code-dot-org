When /^I am on the (\d+)(?:st|nd|rd|th) pixelation test level$/ do |level_num|
  pixelation_lesson = 17
  steps %{
    Given I am on "http://studio.code.org/s/allthethings/lessons/#{pixelation_lesson}/levels/#{level_num}?noautoplay=true"
    And I wait to see a visible dialog with title containing "Puzzle #{level_num}"
    And I close the dialog
    And I wait until pixelation data loads
  }
end

When /^I wait until pixelation data loads$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: 30)
  wait.until {@browser.execute_script("return $('#pixel_data').val() != '';")}
end

When /^I save pixelation data and reload$/ do
  steps %{
    And I press "save_image"
    And I wait until jQuery Ajax requests are finished
    And I reload the page
    And I wait to see "#x-close"
    And element ".modal-body .dialog-title" is visible
    And I close the dialog
    And I wait until pixelation data loads
  }
end

When /^I finish pixelation level and reload$/ do
  pathname = @browser.execute_script("return location.pathname")
  steps %{
    And I press "finished" to load a new page
    And I am on "http://studio.code.org#{pathname}?noautoplay=true"
    And I wait to see "#x-close"
    And element ".modal-body .dialog-title" is visible
    And I close the dialog
    And I wait until pixelation data loads
  }
end

Then /^pixelation data has text "([^"]*)"$/ do |input_text|
  pixel_data = @browser.execute_script("return $('#pixel_data').val()")
  expect(pixel_data.gsub(/[ \n]/, '')).to eq(input_text.gsub(/[ \n]/, ''))
end
