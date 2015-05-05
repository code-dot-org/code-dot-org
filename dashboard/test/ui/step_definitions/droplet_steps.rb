And(/^I wait to see Droplet text mode$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return parseInt($('.droplet-ace').css('left')) > 0;") }
end

And(/^the Droplet ACE text is "([^"]*)"$/) do |expected_text|
  actual_text = @browser.execute_script("return __TestInterface.getDropletContents();")
  actual_text.should eq expected_text
end

And(/^no ACE tooltip is visible$/) do
  is_empty = @browser.execute_script("return $('.ace_editor .tooltipstered').length === 0;")
  is_empty.should eq true
end

And(/^there is a Droplet tooltip with text "([^"]*)"$/) do |tooltip_text|
  has_text = @browser.execute_script("return $('.tooltipster-content :contains(#{tooltip_text})').length > 0;")
  has_text.should eq true
end
