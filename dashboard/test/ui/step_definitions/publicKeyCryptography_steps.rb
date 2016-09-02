# Public Key Cryptography Widget-specific cucumber step definitions

# Which stage of allthethings.script contains the PKC levels; this way we
# only have to update in one place if this changes.
PUBLIC_KEY_CRYPTOGRAPHY_ALLTHETHINGS_STAGE = 31

Given /^I am on the (\d+)(?:st|nd|rd|th)? Public Key Cryptography test level$/ do |level_index|
  steps <<-STEPS
    And I am on "http://learn.code.org/s/allthethings/stage/#{PUBLIC_KEY_CRYPTOGRAPHY_ALLTHETHINGS_STAGE}/puzzle/#{level_index}"
    And I rotate to landscape
  STEPS
end

When /^I set the modulo clock speed to ([1-9])$/ do |speed|
  react_select = @browser.find_element(:css, '.speed-dropdown')
  react_select.click
  react_select_input = react_select.find_element(:css, 'input')
  react_select_input.send_keys(speed.to_s)
  react_select_input.send_key(:return)
end

When /^I set the clock size to (\d+)$/ do |clock_size|
  clock_size_input = @browser.find_element(:css, '.modulus-textbox')
  clock_size_input.click
  10.times { clock_size_input.send_key(:backspace) }
  clock_size_input.send_keys(clock_size.to_s)
end

When /^I set the dividend to (\d+)$/ do |dividend|
  clock_size_input = @browser.find_element(:css, '.dividend-textbox')
  clock_size_input.click
  10.times { clock_size_input.send_key(:backspace) }
  clock_size_input.send_keys(dividend.to_s)
end

When /^I run the modulo clock$/ do
  go_button = @browser.find_element(:css, '.go-button')
  go_button.click
end
