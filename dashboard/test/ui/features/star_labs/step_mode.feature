@single_session
Feature: Step Mode

Scenario: Step Only - Failure
  Given I am on "http://studio.code.org/s/step/lessons/1/levels/1"
    And I wait for the page to fully load
  Then element "#runButton" is hidden
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

  When I drag block "1" to block "5"
    And I press "stepButton"
    And I wait for 1 second
    And I wait until "#stepButton" is not disabled
  Then element "#runButton" is hidden
    And element "#resetButton" is visible
    And element "#stepButton" is not disabled
    And block "5" has class "blocklySelected"
    And block "6" doesn't have class "blocklySelected"

  # After second press, second block is highlighted and step button goes away
  When I press "stepButton"
    And I wait until block "6" has class "blocklySelected"
  Then element "#runButton" is hidden
    And element "#resetButton" is visible
    And element "#stepButton" is disabled
    And block "5" doesn't have class "blocklySelected"
    And block "6" has class "blocklySelected"

  When I press "resetButton"
  Then element "#runButton" is not displayed
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

Scenario: Step Only - Success
  Given I am on "http://studio.code.org/s/step/lessons/1/levels/1"
    And I wait for the page to fully load
  Then element "#runButton" is hidden
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

  When I drag block "1" to block "4"
    And I drag block "1" to block "5"
    And I press "stepButton"
      And I wait for 1 second
      And I wait until "#stepButton" is not disabled
    And I press "stepButton"
      And I wait for 1 second
      And I wait until "#stepButton" is not disabled
    And I press "stepButton"
    And I wait to see "#x-close"
  Then element ".congrats" has text "Congratulations! You completed Puzzle 1."

Scenario: Step Only - Reset while stepping
  Given I am on "http://studio.code.org/s/step/lessons/1/levels/1"
    And I wait for the page to fully load
  Then element "#runButton" is hidden
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

  When I drag block "1" to block "5"
    And I press "stepButton"
    And I wait for 1 second
    And I wait until "#stepButton" is not disabled
  Then element "#runButton" is hidden
    And element "#resetButton" is visible
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

  When I press "resetButton"
  Then element "#runButton" is not displayed
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

Scenario: Step and Run - Stepping
  Given I am on "http://studio.code.org/s/step/lessons/1/levels/2"
    And I wait for the page to fully load
  Then element "#runButton" is visible
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

  When I drag block "1" to block "5"
    And I press "stepButton"
    And I wait for 1 second
    And I wait until "#stepButton" is not disabled
  Then block "5" has class "blocklySelected"
    And block "6" doesn't have class "blocklySelected"
    And element "#runButton" is hidden
    And element "#resetButton" is visible
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

  When I press "resetButton"
  Then element "#runButton" is visible
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled

Scenario: Step and Run - Running
  Given I am on "http://studio.code.org/s/step/lessons/1/levels/2"
    And I wait for the page to fully load
  Then element "#runButton" is visible
    And element "#resetButton" is hidden
    And element "#stepButton" is visible
    And element "#stepButton" is not disabled
  When I drag block "1" to block "5"
    And I press "runButton"
  Then element "#stepButton" is disabled
    And element "#runButton" is hidden
    And element "#resetButton" is visible
    And element "#stepButton" is visible
    And element "#stepButton" is disabled
