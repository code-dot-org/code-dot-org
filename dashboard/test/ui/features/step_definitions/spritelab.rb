Given /^I start a new Sprite ?Lab project$/ do
  steps <<-STEPS
    And I am on "http://studio.code.org/projects/spritelab/new"
    And I rotate to landscape
    And I wait for the page to fully load
  STEPS
end
