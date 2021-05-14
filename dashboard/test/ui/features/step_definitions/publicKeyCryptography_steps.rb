# Public Key Cryptography Widget-specific cucumber step definitions

# Which lesson of allthethings.script contains the PKC levels; this way we
# only have to update in one place if this changes.
PUBLIC_KEY_CRYPTOGRAPHY_ALLTHETHINGS_LESSON = 31

Given /^I am on the (\d+)(?:st|nd|rd|th)? Public Key Cryptography test level$/ do |level_index|
  steps <<-STEPS
    And I am on "http://studio.code.org/s/allthethings/lessons/#{PUBLIC_KEY_CRYPTOGRAPHY_ALLTHETHINGS_LESSON}/levels/#{level_index}"
    And I rotate to landscape
  STEPS
end

When /^I set the modulo clock speed to ([1-9])$/ do |speed|
  set_react_select(@browser.find_element(:css, '.speed-dropdown'), speed)
end

When /^I set the clock size to (\d+)$/ do |clock_size|
  clock_size_input = @browser.find_element(:css, '.modulus-textbox')
  clock_size_input.click
  10.times {clock_size_input.send_key(:backspace)}
  clock_size_input.send_keys(clock_size.to_s)
end

When /^I set the dividend to (\d+)$/ do |dividend|
  clock_size_input = @browser.find_element(:css, '.dividend-textbox')
  clock_size_input.click
  10.times {clock_size_input.send_key(:backspace)}
  clock_size_input.send_keys(dividend.to_s)
end

When /^I run the modulo clock$/ do
  @browser.find_element(:css, '.go-button').click
end

When /^I open view "(Alice|Eve|Bob|All)"$/ do |view|
  @browser.find_element(:xpath, "//button[text()[contains(.,'#{view}')]]").click
end

When /^I click the start over button$/ do
  @browser.find_element(:xpath, "//button[text()='Start Over']").click
end

When /^I click the OK button in the dialog$/ do
  @browser.find_element(:xpath, "//button[text()='OK']").click
end

When /^I set the public modulus to (\d+)$/ do |modulus|
  set_react_select(@browser.find_element(:css, '.panel-eve .public-modulus-dropdown'), modulus)
end

When /^Alice sets her private key to (\d+)$/ do |private_key|
  set_react_select(@browser.find_element(:css, '.panel-alice .private-key-dropdown'), private_key)
end

When /^Bob sets his secret number to (\d+)$/ do |value|
  set_react_select(@browser.find_element(:css, '.panel-bob .secret-number-dropdown'), value)
end

When /^Eve sets Bob's secret number to (\d+)$/ do |value|
  set_react_select(@browser.find_element(:css, '.panel-eve .secret-number-dropdown'), value)
  sleep 6
end

When /^I calculate Bob's public number$/ do
  @browser.find_element(:css, '.panel-bob button').click
  sleep 6
end

When /^Alice decodes Bob's secret number$/ do
  @browser.find_element(:css, '.panel-alice button').click
  sleep 6
end

Then /^(Alice|Bob|Eve)'s ([\w\s]+) is (\d+)$/ do |character, field_name, value|
  expect(@browser.find_element(:css, ".panel-#{character.downcase} .#{field_name.downcase.gsub(/\s+/, '-')}").text.to_i).to eq(value)
end

Then /^Alice knows Bob's secret number is (\d+)$/ do |value|
  expect(@browser.find_element(:css, '.panel-alice .secret-number').text.to_i).to eq(value)
end

Then /^Eve is wrong about Bob's secret number$/ do
  expect(@browser.find_element(:css, '.panel-eve .secret-number-validator').text).to include('Try again')
end

Then /^Eve is right about Bob's secret number$/ do
  expect(@browser.find_element(:css, '.panel-eve .secret-number-validator').text).to include('You got it!')
end

def set_react_select(root_element, value)
  root_element.click
  wrapped_input = root_element.find_element(:css, 'input')
  wrapped_input.send_keys(value.to_s)
  wrapped_input.send_key(:return)
end
