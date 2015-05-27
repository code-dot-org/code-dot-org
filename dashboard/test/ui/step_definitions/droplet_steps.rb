And(/^I wait to see Droplet text mode$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return parseInt($('.droplet-ace').css('left')) > 0;") }
end

And(/^the Droplet ACE text is "([^"]*)"$/) do |expected_text|
  actual_text = @browser.execute_script("return __TestInterface.getDropletContents();")
  actual_text.should eq expected_text
end

And(/^no Tooltipster tooltip is visible$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { !@browser.execute_script("return $('.tooltipster-base').is(':visible');") }
end

And(/^there is a Tooltipster tooltip with text "([^"]*)"$/) do |tooltip_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return $('.tooltipster-content :contains(#{tooltip_text})').length > 0;") }
end
