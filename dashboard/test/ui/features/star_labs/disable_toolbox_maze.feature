Feature: Disabling/Reenabling the Toolbox While Running

Background:
  Given "when run" refers to block "6"
  Given "move forward" refers to block "1"
  Given "turn left" refers to block "2"
  Given "repeat forever" refers to block "4"

Scenario: Toolbox in maze (non-category) is enabled
  Given I am on "http://studio.code.org/s/20-hour/stage/2/puzzle/15?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#runButton" is visible
  Then I drag block "repeat forever" to block "when run"
  Then the workspace has "1" blocks of type "maze_forever"

Scenario: Toolbox in maze (non-category) is disabled while running
  Given I am on "http://studio.code.org/s/20-hour/stage/2/puzzle/16?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#runButton" is visible
  Then I drag block "repeat forever" to block "when run"
  And I drag block "turn left" to block "7" plus offset 35, 50
  Then I slow down execution speed
  And I press "runButton"
  And element "#resetButton" is visible
  Then I wait for 10 seconds
  Then I drag block "repeat forever" to block "when run"
  Then the workspace has "1" blocks of type "maze_forever"

@no_mobile
Scenario: Toolbox in maze (non-category) is reenabled after finished running
  Given I am on "http://studio.code.org/s/20-hour/stage/2/puzzle/17?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#runButton" is visible
  Then I drag block "repeat forever" to block "when run"
  And I drag block "turn left" to block "7" plus offset 35, 50
  And I drag block "move forward" to block "8" plus offset 0, 20
  Then I press "runButton"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  Then I drag block "repeat forever" to block "when run"
  Then the workspace has "2" blocks of type "maze_forever"

Scenario: Toolbox in maze (non-category) is reenabled after hitting reset
  Given I am on "http://studio.code.org/s/20-hour/stage/2/puzzle/18?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#runButton" is visible
  Then I drag block "repeat forever" to block "when run"
  And I drag block "turn left" to block "7" plus offset 35, 50
  Then I press "runButton"
  Then I press "resetButton"
  Then element "#runButton" is visible
  Then I drag block "repeat forever" to block "when run"
  Then the workspace has "2" blocks of type "maze_forever"
