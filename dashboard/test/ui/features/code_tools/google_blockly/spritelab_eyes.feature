@no_mobile
@eyes
Feature: Google Blockly Sprite Lab Eyes

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/36/levels/4?noautoplay=true"
  And I wait for the lab page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I close the instructions overlay if it exists
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: It renders
  When I open my eyes to test "basic rendering test"
  And I see no difference for "variety of start blocks"
  Then I scroll the main blockspace to block "uitest-show-title"
  And I see no difference for "scroll to middle of workspace"
  Then I scroll the main blockspace to block "uitest-when-touching-block"
  And I see no difference for "scroll to when touches block"
  Then I scroll the main blockspace to block "uitest-when-clicked"
  And I see no difference for "scroll to when clicked block"
  And I wait for 3 seconds
  And I close my eyes