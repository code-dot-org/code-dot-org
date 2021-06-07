# Helper steps for dance party levels

Given /^I load the Dance Party free play level/i do
  individual_steps <<-STEPS
    And I am on "http://studio.code.org/s/dance/lessons/1/levels/13?noautoplay=true"
    And I rotate to landscape
    And I wait until I see selector "#runButton"
    And I bypass the age dialog
    And I close the instructions overlay if it exists
  STEPS
end

Given /^I load the Dance Party project level/i do
  individual_steps <<-STEPS
    And I am on "http://studio.code.org/projects/dance/new"
    And I rotate to landscape
    And I wait until I see selector "#runButton"
    And I bypass the age dialog
    And I close the instructions overlay if it exists
  STEPS
end

When /^I bypass the age dialog/i do
  els = @browser.find_elements(:css, '#uitest-age-selector')
  unless els.empty?
    select = Selenium::WebDriver::Support::Select.new(els[0])
    select.select_by(:text, '20')
    button = @browser.find_element(:css, '#uitest-submit-age')
    button.click
  end
end
