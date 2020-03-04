Feature: Disabling/Reenabling the Toolbox While Running

Background:
  Given I am on "http://studio.code.org/s/20-hour/stage/2/puzzle/17?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then I drag block "4" to block "6"
  And I drag block "1" to block "7" plus offset 35, 50

Scenario: Toolbox in maze (non-category) is enabled
  Then the workspace has "1" blocks of type "maze_forever"

Scenario: Toolbox in maze (non-category) is disabled while running
  Then I slow down execution speed
  And I press "runButton"
  Then element "#runButton" is hidden
  And element "#resetButton" is visible
  Then I drag block "4" to block "6"
  Then the workspace has "1" blocks of type "maze_forever"

@no_mobile
Scenario: Toolbox in maze (non-category) is reenabled after finished running
  Then I press "runButton"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  Then I drag block "4" to block "6"
  Then the workspace has "2" blocks of type "maze_forever"

Scenario: Toolbox in maze (non-category) is reenabled after hitting reset
  Then I press "runButton"
  Then I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then I drag block "4" to block "6"
  Then the workspace has "2" blocks of type "maze_forever"
