@no_mobile
@eyes
Feature: Modal Function Editor Eyes

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/36/levels/3?noautoplay=true"
  And I wait for the lab page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I close the instructions overlay if it exists
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Edit a function
  When I open my eyes to test "edit a function"
  Then I click block field that is number 1 in the list of blocks and number 1 in the field row
  And element "#modalFunctionEditor" is visible
  # Open Sprites flyout
  And I press "blockly-d"
  # Drag new sprite block to top of function
  And I drag block number 2 to offset "40, 100"
  And I see no difference for "add a new block to the function"
  # Close function
  And I press "closeModalFunctionEditor"
  And element "#modalFunctionEditor" is not visible
  And I press "runButton"
  And I wait for 3 seconds
  And I see no difference for "run the program with the updated function"
  And I close my eyes