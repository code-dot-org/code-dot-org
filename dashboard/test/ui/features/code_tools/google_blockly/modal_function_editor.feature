Feature: Modal Function Editor

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/36/levels/3?noautoplay=true&blocklyVersion=google"
  And I wait for the page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I close the instructions overlay if it exists
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

@skip
Scenario: Can create a Function
  Then element "#blockly-9" is visible
  And element "#modalFunctionEditor" is not visible
  And I press "blockly-9"
  And the open flyout has 1 blocks
  And I click toolbox block with selector ".blocklyFlyoutButton"
  # Open modal function editor
  And I wait until element "#modalFunctionEditor" is visible
  # Close editor
  And I press "closeModalFunctionEditor"
  # Now the function should be in the toolbox, along with the original function from start code
  Then I press "blockly-9"
  And the open flyout has 2 blocks

Scenario: Can edit a Function
  #Then I press "blockly-1"
  #Then I drag block "new-sprite-block" to block "set-background-call" plus offset 24, 30
  #And I wait for 3 seconds
  Then I click block field that is number 1 in the list of blocks and number 1 in the field row
  And element "#modalFunctionEditor" is visible
  # Open Sprites flyout
  And I press "blockly-d"
  And I drag and drop block "new-sprite-block" to offset 70, 177
  #And I drag block "new-sprite-block" to block "set-background-block" plus offset 24, 30
  And I wait for 3 seconds

