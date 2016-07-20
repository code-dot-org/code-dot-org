# Gamelab-specific cucumber step definitions

# Which stage of allthethings.script contains the gamelab levels; this way we
# only have to update in one place if this changes.
GAMELAB_ALLTHETHINGS_STAGE = 19

Given /^I start a new Game ?Lab project$/ do
  steps <<-STEPS
    And I am on "http://learn.code.org/projects/gamelab/new"
    And I rotate to landscape
    And I wait to see "#runButton"
  STEPS
end

Given /^I am on the (\d+)(?:st|nd|rd|th)? Game ?Lab test level$/ do |level_index|
  steps <<-STEPS
    And I am on "http://learn.code.org/s/allthethings/stage/#{GAMELAB_ALLTHETHINGS_STAGE}/puzzle/#{level_index}"
    And I rotate to landscape
    And I wait to see "#runButton"
  STEPS
end

When /^I (?:run the game|press run)$/ do
  # Use a short wait to surface any errors that occur during the first few frames
  steps <<-STEPS
    And I press "runButton"
    And I wait for 2 seconds
  STEPS
end

When /^I (?:reset the game|press reset)$/ do
  steps 'And I press "resetButton"'
end

When /^I switch to(?: the)? animation (?:mode|tab)$/ do
  steps 'When I press "animationMode"'
end

Then /^I do not see "([^"]*)" in the Game Lab console$/ do |message|
  expect(element_contains_text?('#debug-output', message)).to be false
end

Then /^I see (\d+) animations in the animation column$/ do |num_animations|
  expect(@browser.execute_script('return $(".animationList>div>div").not(".newListItem").length')).to eq num_animations.to_i
end
