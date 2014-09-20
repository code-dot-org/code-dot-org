Feature: Step Mode

Scenario: Step Only - Failure
  Given I am on "http://learn.code.org/s/step/puzzle/1"
  Then element "#runButton" is hidden
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled
  Then I drag block "1" to block "5"
  Then I press "stepButton"
  And element "#stepButton" is disabled
  And I wait for 3 seconds
  And element "#runButton" is hidden
  And element "#resetButton" is visible
  And element "#stepButton" is not disabled
  And block "5" has class "blocklySpotlight"
  And block "6" doesn't have class "blocklySpotlight"

  # After second press, second block is highlighted and step button goes away
  Then I press "stepButton"
  And element "#stepButton" is disabled
  And I wait for 3 seconds
  And element "#runButton" is hidden
  And element "#resetButton" is visible
  And element "#stepButton" is disabled
  And block "5" doesn't have class "blocklySpotlight"
  And block "6" has class "blocklySpotlight"
  Then I wait to see "#x-close"
  And I press "x-close"
  And element "#runButton" is hidden
  And element "#resetButton" is visible
  And element "#stepButton" is disabled
  # Last block is still highlighted
  And block "5" doesn't have class "blocklySpotlight"
  And block "6" has class "blocklySpotlight"

  Then I press "resetButton"
  Then element "#runButton" is hidden
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled

Scenario: Step Only - Success
  Given I am on "http://learn.code.org/s/step/puzzle/1"
  Then element "#runButton" is hidden
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled
  Then I drag block "1" to block "4"
  Then I drag block "1" to block "5"
  Then I press "stepButton"
  And I wait for 3 seconds
  Then I press "stepButton"
  And I wait for 3 seconds
  Then I press "stepButton"
  And I wait for 3 seconds
  Then I wait to see "#x-close"
  And element ".congrats" has text "Congratulations! You completed Puzzle 1."

Scenario: Step Only - Reset while stepping
  Given I am on "http://learn.code.org/s/step/puzzle/1"
  Then element "#runButton" is hidden
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled
  Then I drag block "1" to block "5"
  Then I press "stepButton"
  And element "#stepButton" is disabled
  And I wait for 3 seconds
  And element "#runButton" is hidden
  And element "#resetButton" is visible
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled
  Then I press "resetButton"
  And element "#runButton" is hidden
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled


Scenario: Step and Run - Stepping
  Given I am on "http://learn.code.org/s/step/puzzle/2"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled
  Then I drag block "1" to block "5"
  Then I press "stepButton"
  And element "#stepButton" is disabled
  And I wait for 3 seconds
  And block "5" has class "blocklySpotlight"
  And block "6" doesn't have class "blocklySpotlight"
  Then element "#runButton" is hidden
  And element "#resetButton" is visible
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled


Scenario: Step and Run - Running
  Given I am on "http://learn.code.org/s/step/puzzle/2"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And element "#stepButton" is visible
  And element "#stepButton" is not disabled
  Then I drag block "1" to block "5"
  Then I press "runButton"
  And element "#stepButton" is disabled
  Then element "#runButton" is hidden
  And element "#resetButton" is visible
  And element "#stepButton" is visible
  And element "#stepButton" is disabled
