Feature: Hour of Code 2015 tutorial is completable

Background:
  Given I sign in as a student
  And I am on "http://learn.code.org/s/hoc2015/reset"
  And execute JavaScript expression "window.localStorage.clear()"

Scenario: Solving puzzle 1
  Given I am on "http://learn.code.org/s/hoc2015/stage/1/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait to see a dialog titled "Puzzle 1 of 15"
  And I close the dialog
  When I drag droplet block "moveRight" to line 2
  And I press "runButton"
  And I wait to see ".modal"
  Then element "#continue-button" is visible
  When I close the dialog
  Then I wait to see a dialog titled "Puzzle 2 of 15"
  And I close the dialog
  When element "#runButton" is visible
  Then element ".header_middle a:first" has class "level_link perfect"
