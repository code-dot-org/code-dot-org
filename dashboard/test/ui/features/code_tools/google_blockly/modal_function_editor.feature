@no_mobile
Feature: Modal Function Editor

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/36/levels/3?noautoplay=true"
  And I wait for the lab page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I close the instructions overlay if it exists
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Can create a function
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

Scenario: Can edit a function
  # Click the "edit" button on the block
  Then I click block field that is number 1 in the list of blocks and number 1 in the field row
  And element "#modalFunctionEditor" is visible
  # Open Sprites flyout
  And I press "blockly-d"
  # Drag new sprite block to top of function
  And I drag block number 2 to offset "40, 100"
  # Close function
  And I press "closeModalFunctionEditor"
  And element "#modalFunctionEditor" is not visible
  # Re-open function
  Then I click block field that is number 1 in the list of blocks and number 1 in the field row
  And element "#modalFunctionEditor" is visible
  # Now the function editor workspace should have 4 blocks: the procedure block,
  # the set background block, the new sprite block, and the location block attached to the new sprite block.
  Then the function editor workspace has 4 blocks

@chrome
Scenario: Can close the editor using the ESC key
  # Open the editor
  Then I click block field that is number 1 in the list of blocks and number 1 in the field row
  And element "#modalFunctionEditor" is visible
  # Close editor
  Then I press keys ":escape" for element "body"
  And element "#modalFunctionEditor" is not visible