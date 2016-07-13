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
