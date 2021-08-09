# NetSim-specific Cucumber step definitions

# Which lesson of allthethings.script contains the netsim levels; this way we
# only have to update in one place if this changes.
NETSIM_ALLTHETHINGS_LESSON = 14

# Given I am on the 1st NetSim test level
# Navigates to the requested level in the AllTheThings script.
Given /^I am on the (\d+)(?:st|nd|rd|th)? (?:Net ?Sim|Internet Simulator) test level$/ do |level_index|
  steps <<-STEPS
    And I am on "http://studio.code.org/s/allthethings/lessons/#{NETSIM_ALLTHETHINGS_LESSON}/levels/#{level_index}?noautoplay=true"
    And I rotate to landscape
  STEPS
end

When /^I enter the netsim name "([^"]*)"$/ do |username|
  steps %{
    And I wait until element "#netsim-lobby-name" is visible
    And I type "#{username}" into "#netsim-lobby-name"
    And I press the "Set Name" button
  }
end

Then /^there is a router in the lobby$/ do
  steps <<-STEPS
    Then element ".netsim-lobby-panel table" contains text "Nobody connected yet"
  STEPS
end
