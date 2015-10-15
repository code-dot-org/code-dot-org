Feature: Hour of Code progress is saved on client side when puzzles are solved and shows up in the bubbles on the header

Background:
  Given I am on "http://studio.code.org/hoc/reset"

Scenario: Solving puzzle 1, proceeding to puzzle 2, verifying that puzzle 1 appears as solved
  Given I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 1 of 20"
  And I close the dialog
  Then I wait until element "#runButton" is visible
  And I drag block "1" to block "5"
  And I press "runButton"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1."
  Then I close the dialog
  Then I wait to see a dialog titled "Puzzle 2 of 20"
  And I close the dialog
  When element "#runButton" is visible
  Then element ".header_middle a:first" has class "level_link perfect"

Scenario: Failing at puzzle 1, refreshing puzzle 1, bubble should show up as attempted
  Given I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 1 of 20"
  And I close the dialog
  Then I wait until element "#runButton" is visible
  And I press "runButton"
  Then I wait to see ".modal"
  Then I close the dialog
  Then I reload the page
  Then I wait to see ".modal"
  And I close the dialog
  When element "#runButton" is visible
  Then element ".header_middle a:first" has class "level_link attempted"

@no_mobile
Scenario: Go to puzzle 6, see video, go somewhere else, return to puzzle 6, should not see video
  Given I am on "http://studio.code.org/hoc/6"
  And I rotate to landscape
  Then I wait until element "#video" is visible
  Then I close the dialog
  Then I wait to see a dialog titled "Puzzle 6 of 20"
  Then I close the dialog
  Then I am on "http://studio.code.org/hoc/7"
  Then I am on "http://studio.code.org/hoc/6"
  Then element "#video" does not exist

Scenario: Go to puzzle 9, see callouts, go somewhere else, return to puzzle 9, should not see callouts
  Given I am on "http://studio.code.org/hoc/9"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 9 of 20"
  And I close the dialog
  Then element "#qtip-4-content" is visible
  Then I am on "http://studio.code.org/hoc/10"
  Then I am on "http://studio.code.org/hoc/9"
  Then element "#qtip-4-content" does not exist