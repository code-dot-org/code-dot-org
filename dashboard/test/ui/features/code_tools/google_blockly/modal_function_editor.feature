Feature: Modal Function Editor

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/36/levels/3?noautoplay=true&blocklyVersion=google"
  And I wait for the page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I close the instructions overlay if it exists
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Can create a Function
  Then element "#blockly-9" is visible
  And element "#modalFunctionEditor" is not visible
  And I press "blockly-9"
  And I click toolbox block with selector ".blocklyFlyoutButton"
  And I wait until element "#modalFunctionEditor" is visible
