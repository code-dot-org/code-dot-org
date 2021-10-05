Feature: Sprite Lab

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/36/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I close the instructions overlay if it exists
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "spritelab/avatar"

Scenario: Losing the first level
  Then I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" has escaped text "Keep coding! Something's not quite right yet."
  And I press "resetButton"
  And element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Winning the first level
  Then I press dropdown number 6
  And the dropdown is visible
  And I select item 1 from the dropdown
  And I wait for 1 seconds
  Then the dropdown is hidden
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".congrats" is visible
