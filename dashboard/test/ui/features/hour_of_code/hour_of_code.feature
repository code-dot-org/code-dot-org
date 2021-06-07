Feature: Hour of Code progress is saved on client side when puzzles are solved and shows up in the bubbles on the header

Background:
  Given I am on "http://studio.code.org/hoc/reset"

Scenario: Solving puzzle 1, proceeding to puzzle 2, verifying that puzzle 1 appears as solved
  Given I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I drag block "1" to block "5"
  And I press "runButton"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1."
  Then I close the dialog
  And I wait until I am on "http://studio.code.org/hoc/2"
  And I wait for the page to fully load
  And I verify progress in the header of the current page is "perfect" for level 1
  # Course overview should also show progress
  Then I navigate to the course page for "hourofcode"
  And I verify progress for lesson 1 level 1 is "perfect"
  # Course overview in a different script shouldn't show progress
  Then I am on "http://studio.code.org/s/20-hour/lessons/2/levels/2?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/s/20-hour/lessons/2/levels/2?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 1
  # Level source is saved
  Then I am on "http://studio.code.org/hoc/1?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait for the page to fully load
  And block "6" is child of block "5"
  # Level source is reset
  Then I am on "http://studio.code.org/hoc/reset"
  Then I am on "http://studio.code.org/hoc/1?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait for the page to fully load
  And element "g[block-id=\'6\']" does not exist

Scenario: Failing at puzzle 1, refreshing puzzle 1, bubble should show up as attempted
  Given I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I press "runButton"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  Then I reload the page
  And I wait for the page to fully load
  And I verify progress in the header of the current page is "attempted" for level 1
  And I navigate to the course page for "hourofcode"
  And I verify progress for lesson 1 level 1 is "attempted"

@no_mobile
Scenario: Go to puzzle 10, see video, go somewhere else, return to puzzle 10, should not see video, comes back on link
  Given I am on "http://studio.code.org/hoc/10"
  And I rotate to landscape
  Then I wait until element ".video-modal" is visible
  Then I close the dialog
  Then I am on "http://studio.code.org/hoc/11"
  Then I wait until I am on "http://studio.code.org/hoc/11"
  And I wait for the page to fully load
  Then I am on "http://studio.code.org/hoc/10"
  Then I wait until I am on "http://studio.code.org/hoc/10"
  And I wait for the page to fully load
  Then I click selector ".reference_area a:last"

Scenario: Go to puzzle 9, see callouts, go somewhere else, return to puzzle 9, should not see callouts
  Given I am on "http://studio.code.org/hoc/9?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".qtip-content:contains('Blocks that are grey')" is visible
  Then I am on "http://studio.code.org/hoc/10?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/hoc/10?noautoplay=true"
  And I wait for the page to fully load
  Then I am on "http://studio.code.org/hoc/9?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/hoc/9?noautoplay=true"
  And I wait for the page to fully load
  Then element ".qtip-content:contains('Blocks that are grey')" does not exist
