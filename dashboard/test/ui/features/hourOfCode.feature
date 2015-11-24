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
  Then element ".header_middle a.level_link:first" has class "perfect"
  # Course overview should also show progress
  Then I am on "http://studio.code.org/s/hourofcode"
  And I wait to see ".user-stats-block"
  And element ".user-stats-block a.level_link:first" has class "perfect"
  # Course overview in a different script shouldn't show progress
  Then I am on "http://studio.code.org/s/20-hour/stage/2/puzzle/2?noautoplay=true"
  And I wait to see a dialog titled "Puzzle 2 of 20"
  And I close the dialog
  And element "#runButton" is visible
  And element ".header_middle a.level_link:first" does not have class "perfect"
  # Level source is saved
  Then I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait to see a dialog titled "Puzzle 1 of 20"
  And I close the dialog
  And I wait until element "#runButton" is visible
  And block "6" is child of block "5"
  # Level source is reset
  Then I am on "http://studio.code.org/hoc/reset"
  Then I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait to see a dialog titled "Puzzle 1 of 20"
  And I close the dialog
  And I wait until element "#runButton" is visible
  And element "g[block-id=\'6\']" does not exist

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
  Then element ".header_middle a.level_link:first" has class "attempted"
  And I am on "http://studio.code.org/s/hourofcode"
  And element ".user-stats-block a.level_link:first" has class "attempted"

@no_mobile
Scenario: Go to puzzle 10, see video, go somewhere else, return to puzzle 10, should not see video, comes back on link
  Given I am on "http://studio.code.org/hoc/10"
  And I rotate to landscape
  Then I wait until element "#video" is visible
  Then I close the dialog
  Then I wait to see a dialog titled "Puzzle 10 of 20"
  Then I close the dialog
  Then I am on "http://studio.code.org/hoc/11"
  Then I wait to see a dialog titled "Puzzle 11 of 20"
  Then I am on "http://studio.code.org/hoc/10"
  Then I wait to see a dialog titled "Puzzle 10 of 20"
  Then I close the dialog
  Then I click selector ".reference_area a:last"

Scenario: Go to puzzle 9, see callouts, go somewhere else, return to puzzle 9, should not see callouts
  Given I am on "http://studio.code.org/hoc/9?noautoplay=true"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 9 of 20"
  And I close the dialog
  Then element ".qtip-content:contains('Blocks that are grey')" is visible
  Then I am on "http://studio.code.org/hoc/10?noautoplay=true"
  Then I wait to see a dialog titled "Puzzle 10 of 20"
  And I close the dialog
  Then I am on "http://studio.code.org/hoc/9?noautoplay=true"
  Then I wait to see a dialog titled "Puzzle 9 of 20"
  And I close the dialog
  Then element ".qtip-content:contains('Blocks that are grey')" does not exist
