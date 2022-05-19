# Brad (2018-11-14) Skip on IE due to webdriver exception
@no_ie
@single_session
Feature: Complete a bounce level

Scenario: Complete Level 1
  Given I am on "http://studio.code.org/s/events/lessons/1/levels/1?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I drag Google Blockly block "1" to block "0"
  Then Google Blockly block "1" is child of block "0"
  And I press "runButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 1."

Scenario: Complete Level 3
  Given I am on "http://studio.code.org/s/events/lessons/1/levels/3?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I drag Google Blockly block "3" to block "0"
  Then Google Blockly block "1" is child of block "0"
  And I press "runButton"
  And I hold key "UP"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 3."

@no_mobile
Scenario: Incomplete Level 5
  Given I am on "http://studio.code.org/s/events/lessons/1/levels/5?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I press "runButton"
  And I wait to see ".uitest-topInstructions-inline-feedback"
  And element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" has escaped text "Not quite. You have to use a block you aren’t using yet."

Scenario: Complete Level 5
  Given I am on "http://studio.code.org/s/events/lessons/1/levels/5?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I drag Google Blockly block "1" to block "0"
  Then Google Blockly block "1" is child of block "0"
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 5."

Scenario: Complete Bounce freeplay level
  Given I am on "http://studio.code.org/s/course3/lessons/15/levels/10?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  And element "#finishButton" is not visible
  And I press "runButton"
  And element "#finishButton" is visible
  And I press "finishButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
