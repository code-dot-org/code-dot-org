Feature: Flappy puzzles can be solved

Scenario: Solving puzzle 1
  Given I am on "http://studio.code.org/flappy/1?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/flappy/1?noautoplay=true"
  And I wait for the lab page to fully load
  And I drag block "flap" to block "whenClick"
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.gravity = -1, Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1"

Scenario: Solving puzzle 2
  Given I am on "http://studio.code.org/flappy/2?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/flappy/2?noautoplay=true"
  And I wait for the lab page to fully load
  And I drag block "endGame" to block "whenCollideGround"
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.onMouseDown(), true;"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 2"

@no_mobile
Scenario: Failing puzzle 2
  Given I am on "http://studio.code.org/flappy/2?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/flappy/2?noautoplay=true"
  And I wait for the lab page to fully load
  And I press "runButton"
  Then evaluate JavaScript expression "Flappy.onMouseDown(), true;"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  And element ".uitest-topInstructions-inline-feedback" contains text "Not quite. You have to use a block you aren’t using yet."
