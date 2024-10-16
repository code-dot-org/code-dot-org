Feature: Complete a bee level

Scenario: Complete Bee Conditions 4-5 Level 3
  Given I am on "http://studio.code.org/s/course3/lessons/7/levels/3?noautoplay=true"
  And I wait for the lab page to fully load
  When I dismiss the login reminder
  # repeat to when run
  And I drag block "repeat" to block "whenRun"
  And I set block "repeat" to have a value of "2" for field "TIMES"
  # move forward inside repeat block
  And I drag block "moveForward" to block "repeat" plus offset 35, 30
  # add an if block
  And I drag block "ifHoney" to block "moveForward"
  # second move forward above if block
  And I drag block "moveForward" to block "moveForward"
  # get honey inside if block
  And I drag block "makeHoney" to block "ifHoney" plus offset 35, 30
  # turn left as child of if block
  And I drag block "turnLeft" to block "ifHoney" plus offset 0, 60
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 3."
