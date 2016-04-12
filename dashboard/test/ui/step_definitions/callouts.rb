And(/^callout "([^"]*)" has text: (.*)$/) do |callout_id, text|
  callout_has_text?(callout_id, text)
end

And(/^callout "([^"]*)" is visible$/) do |callout_id|
  short_wait.until { callout_visible?(callout_id) }
  callout_visible?(callout_id).should eq true
end

And(/^callout "([^"]*)" is hidden$/) do |callout_id|
  short_wait.until { !callout_visible?(callout_id) }
  callout_visible?(callout_id).should eq false
end

And(/^I close callout "([^"]*)"$/) do |callout_id|
  xpath = "(//*[contains(@class, 'cdo-qtips')])[#{callout_id.to_i + 1}]/div[3]"
  @button = @browser.find_element(:xpath, xpath)
  @button.click
  short_wait.until { !callout_visible?(callout_id) }
end

And(/^callout "([^"]*)" does not exist$/) do |callout_id|
  callout_exists?(callout_id).should eq false
end

And(/^callout "([^"]*)" exists$/) do |callout_id|
  callout_exists?(callout_id).should eq true
end
