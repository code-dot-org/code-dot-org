Feature: Complete a bee level

Scenario: Complete Bee Conditions 4-5 Level 3
  Given I am on "http://studio.code.org/s/course3/lessons/7/levels/3?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  # repeat to when run
  And I drag block "6" to block "8"
  And I set block "9" to have a value of "2" for title "TIMES"
  # move forward inside repeat block
  And I drag block "1" to block "9" plus offset 35, 30
  # second move forward
  And I drag block "1" to block "10"
  # add an if block
  And I drag block "7" to block "11"
  # get honey inside if block
  And I drag block "5" to block "12" plus offset 35, 30
  # turn left as child of if block
  And I drag block "3" to block "12" plus offset 0, 60
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 3."
