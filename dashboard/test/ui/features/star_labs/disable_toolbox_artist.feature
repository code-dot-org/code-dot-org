Feature: Disabling/Reenabling the Toolbox While Running

Background:
  Given I am on "http://studio.code.org/s/20-hour/stage/19/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then I set slider speed to medium

Scenario: Toolbox in artist category view is enabled
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And I press ":4.label"
  And I drag block "16" to offset "0, 10"
  Then the workspace has "1" blocks of type "controls_repeat"

Scenario: Toolbox in artist category view is disabled while running
  Then I press "runButton"
  Then element "#runButton" is hidden
  And element "#resetButton" is visible
  And I press ":4.label"
  And I drag block "16" to offset "0, 10"
  Then the workspace has "0" blocks of type "controls_repeat"

Scenario: Toolbox in artist category view is reenabled after finished running a short level
  Given I am on "http://studio.code.org/s/20-hour/stage/11/puzzle/5?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I press "runButton"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  And I press ":4.label"
  And I drag block "4" to offset "0, 10"
  Then the workspace has "1" blocks of type "controls_repeat"

Scenario: Toolbox in artist category view is reenabled after hitting reset
  Then I press "runButton"
  Then I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And I press ":4.label"
  And I drag block "16" to offset "0, 10"
  Then the workspace has "1" blocks of type "controls_repeat"
