Feature: Flappy puzzles can be solved

Scenario: Solving puzzle 1
  Given I am on "http://learn.code.org/flappy/1?noautoplay=true"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 1 of 10"
  And I press "x-close"
  Then I wait until element "#runButton" is visible
  And I drag block "1" to block "3"
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.gravity = -1, Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1"

Scenario: Solving puzzle 2
  Given I am on "http://learn.code.org/flappy/2?noautoplay=true"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 2 of 10"
  And I press "x-close"
  Then I wait until element "#runButton" is visible
  And I drag block "2" to block "6"
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 2"

@no_mobile
Scenario: Failing puzzle 2
  Given I am on "http://learn.code.org/flappy/2?noautoplay=true"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 2 of 10"
  And I press "x-close"
  Then I wait until element "#runButton" is visible
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "Try one or more of the blocks below to solve this puzzle"
