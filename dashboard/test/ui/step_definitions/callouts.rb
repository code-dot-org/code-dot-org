And(/^callout "([^"]*)" has text: (.*)$/) do |callout_id, text|
  element_has_text("#qtip-#{callout_id}-content", text)
end

And(/^callout "([^"]*)" is visible$/) do |callout_id|
  short_wait.until { is_callout_visible(callout_id) }
  is_callout_visible(callout_id).should eq true
end

And(/^callout "([^"]*)" is hidden$/) do |callout_id|
  short_wait.until { !is_callout_visible(callout_id) }
  is_callout_visible(callout_id).should eq false
end

And(/^I close callout "([^"]*)"$/) do |callout_id|
  xpath = "//*[@id='qtip-#{callout_id}']/div[3]/img"
  @button = @browser.find_element(:xpath, xpath)
  @button.click
  short_wait.until { !is_callout_visible(callout_id) }
end

And(/^callout "([^"]*)" does not exist$/) do |callout_id|
  callout_exists(callout_id).should eq false
  end

And(/^callout "([^"]*)" exists$/) do |callout_id|
  callout_exists(callout_id).should eq true
end