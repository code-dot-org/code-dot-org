Given /^I start a new Sprite ?Lab project$/ do
  steps <<-STEPS
    And I am on "http://studio.code.org/projects/spritelab/new"
    And I wait for the lab page to fully load
  STEPS
end
