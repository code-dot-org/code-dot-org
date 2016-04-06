When /^I wait until pixelation data loads$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: 30)
  wait.until {@browser.execute_script("return $('#pixel_data').val() != '';")}
end

When /^I save pixelation data and reload$/ do
  steps %{
    And I press "save_image"
    And I wait for 5 seconds
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
    And I press "finished"
    And I get redirected away from "#{pathname}"
    And I am on "http://studio.code.org#{pathname}?noautoplay=true"
    And I wait to see "#x-close"
    And element ".modal-body .dialog-title" is visible
    And I close the dialog
    And I wait until pixelation data loads
  }
end

Then /^pixelation data has text "([^"]*)"$/ do |input_text|
  pixel_data = @browser.execute_script("return $('#pixel_data').val()")
  pixel_data.gsub(/[ \n]/, '').should eq input_text.gsub(/[ \n]/, '')
end
