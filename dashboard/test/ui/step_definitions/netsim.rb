When /^I load netsim in DNS mode$/ do
  steps <<-STEPS
    And I am on "http://learn.code.org/s/allthethings/stage/14/puzzle/4?noautoplay=true"
    And I wait to see "#netsim-lobby-name"
  STEPS
  steps "And I close the dialog" if @browser.find_element(:id => 'x-close') rescue false
end

When /^I load netsim in bit-sending mode$/ do
  steps <<-STEPS
    And I am on "http://learn.code.org/s/allthethings/stage/14/puzzle/1?noautoplay=true"
    And I wait to see "#netsim-lobby-name"
  STEPS
  steps "And I close the dialog" if @browser.find_element(:id => 'x-close') rescue false
end

When /^I enter the netsim name "([^"]*)"$/ do |username|
  steps %{
    And I type "#{username}" into "#netsim-lobby-name"
    And I press the "Set Name" button
  }
end

Then /^there is a router in the lobby$/ do
  steps <<-STEPS
    Then element ".netsim-lobby-panel table" contains text "Nobody connected yet"
  STEPS
end
