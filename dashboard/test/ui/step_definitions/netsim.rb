When /^I load netsim$/ do
  # Stage 3 puzzle 4 is the "Everything is Enabled" level, for now.
  steps %q{
    And I am on "http://learn.code.org/s/netsim/stage/3/puzzle/4?disableCleaning=true"
    And I wait to see "#netsim-lobby-name"
  }
end

When /^I enter the netsim name "([^"]*)"$/ do |username|
  steps %{
    And I type "#{username}" into "#netsim-lobby-name"
    And I press the "Set Name" button
  }
end

Then /^there is a router in the lobby$/ do
  steps %q{
    Then element ".netsim-lobby-panel table" contains text "Nobody connected yet"
  }
end
