Feature: Complete a bounce level

Scenario: Complete Level 1
  Given I am on "http://learn.code.org/2014/1?noautoplay=true"
  When I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And I drag block "1" to block "3"
  Then block "4" is child of block "3"
  And I press "runButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 1."

Scenario: Complete Level 3
  Given I am on "http://learn.code.org/2014/3?noautoplay=true"
  When I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And I drag block "3" to block "5"
  Then block "6" is child of block "5"
  And I press "runButton"
  And I hold key "UP"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 3."

@no_mobile
Scenario: Incomplete Level 5
  Given I am on "http://learn.code.org/2014/5?noautoplay=true"
  When I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Try one or more of the blocks below to solve this puzzle."

Scenario: Complete Level 5
  Given I am on "http://learn.code.org/2014/5?noautoplay=true"
  When I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And I drag block "1" to block "3"
  Then block "4" is child of block "3"
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 5."
