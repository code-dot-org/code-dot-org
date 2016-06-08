Feature: Complete a bounce level

Scenario: Complete Level 1
  Given I am on "http://learn.code.org/s/events/stage/1/puzzle/1?noautoplay=true"
  When I rotate to landscape
  And I wait to see a dialog titled "Puzzle 1 of 10"
  And I close the dialog
  And I drag block "1" to block "3"
  Then block "4" is child of block "3"
  And I press "runButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 1."

Scenario: Complete Level 3
  Given I am on "http://learn.code.org/s/events/stage/1/puzzle/3?noautoplay=true"
  When I rotate to landscape
  And I wait to see a dialog titled "Puzzle 3 of 10"
  And I close the dialog
  And I drag block "3" to block "5"
  Then block "6" is child of block "5"
  And I press "runButton"
  And I hold key "UP"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 3."

@no_mobile
Scenario: Incomplete Level 5
  Given I am on "http://learn.code.org/s/events/stage/1/puzzle/5?noautoplay=true"
  When I rotate to landscape
  And I wait to see a dialog titled "Puzzle 5 of 10"
  And I close the dialog
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Not quite. You have to use a block you aren’t using yet."

Scenario: Complete Level 5
  Given I am on "http://learn.code.org/s/events/stage/1/puzzle/5?noautoplay=true"
  When I rotate to landscape
  And I wait to see a dialog titled "Puzzle 5 of 10"
  And I close the dialog
  And I drag block "1" to block "3"
  Then block "4" is child of block "3"
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 5."

Scenario: Complete Bounce freeplay level
  Given I am on "http://learn.code.org/s/course3/stage/15/puzzle/10?noautoplay=true"
  When I rotate to landscape
  And I wait to see a dialog titled "Puzzle 10 of 10"
  And I close the dialog
  And element "#finishButton" is not visible
  And I press "runButton"
  And element "#finishButton" is visible
  And I press "finishButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
