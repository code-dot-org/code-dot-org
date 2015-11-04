Feature: Hour of Code 2015 tutorial is completable

Background:
  Given I sign in as a student
  And I am on "http://learn.code.org/s/hoc2015/reset"
  And execute JavaScript expression "window.localStorage.clear()"

@no_ie @no_mobile
Scenario: Solving puzzle 1 in block mode
  Given I rotate to landscape
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

Scenario: Solving puzzle 1 in text mode
  Given I rotate to landscape
  And I wait to see a dialog titled "Puzzle 1 of 15"
  And I close the dialog
  When I switch to text mode
  And I append text to droplet "moveRight();\n"
  And I press "runButton"
  And I wait to see ".modal"
  Then element "#continue-button" is visible
  When I close the dialog
  Then I wait to see a dialog titled "Puzzle 2 of 15"
  And I close the dialog
  When element "#runButton" is visible
  Then element ".header_middle a:first" has class "level_link perfect"
