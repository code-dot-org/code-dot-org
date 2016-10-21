Feature: Flappy puzzles can be solved

Scenario: Solving puzzle 1
  Given I am on "http://studio.code.org/flappy/1?noautoplay=true"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 1 of 10"
  And I close the dialog
  Then I wait until element "#runButton" is visible
  And I drag block "1" to block "3"
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.gravity = -1, Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1"

Scenario: Solving puzzle 2
  Given I am on "http://studio.code.org/flappy/2?noautoplay=true"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 2 of 10"
  And I close the dialog
  Then I wait until element "#runButton" is visible
  And I drag block "2" to block "6"
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 2"

@no_mobile
Scenario: Failing puzzle 2
  Given I am on "http://studio.code.org/flappy/2?noautoplay=true"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 2 of 10"
  And I close the dialog
  Then I wait until element "#runButton" is visible
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "Not quite. You have to use a block you aren’t using yet."
