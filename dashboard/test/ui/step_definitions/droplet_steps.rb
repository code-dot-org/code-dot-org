And(/^I wait to see Droplet text mode$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return parseInt($('.droplet-ace').css('left')) > 0;") }
end

And(/^the Droplet ACE text is "([^"]*)"$/) do |expected_text|
  actual_text = @browser.execute_script("return __TestInterface.getDropletContents();")
  actual_text.should eq expected_text
end
