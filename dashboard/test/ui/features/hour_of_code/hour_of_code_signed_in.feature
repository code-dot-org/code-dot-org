@as_student
Feature: Hour of Code tests for users that are signed in

Scenario:
  Given I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait for the page to fully load
  And I drag block "1" to block "5"
  And I press "runButton"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1."
  Then I close the dialog
  Then I wait until I am on "http://studio.code.org/hoc/2"
  And I wait for the page to fully load
  When element "#runButton" is visible
  And I verify progress in the header of the current page is "perfect" for level 1
  # Course overview should also show progress
  Then I navigate to the course page for "hourofcode"
  And I verify progress for stage 1 level 1 is "perfect"
  # Course overview in a different script shouldn't show progress
  Then I am on "http://studio.code.org/s/20-hour/stage/2/puzzle/2?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 1
  # Level source is saved
  Then I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait for the page to fully load
  And block "6" is child of block "5"
  # Level source is reset
  Then I am on "http://studio.code.org/hoc/reset"
  Then I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait for the page to fully load
  And block "6" is child of block "5"

Scenario: Failing at puzzle 6, refreshing puzzle 6, bubble should show up as attempted
  Given I am on "http://studio.code.org/hoc/6?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I press "runButton"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  Then I reload the page
  And I wait for the page to fully load
  When element "#runButton" is visible
  Then I verify progress in the header of the current page is "attempted" for level 6

# The server should be the source of truth. If we have a stale read, that means we haven't saved the user progress.
Scenario: Async progress write followed by a stale read
  Given I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I wait for the page to fully load
  And I verify progress in the header of the current page is "not_tried" for level 20
  Then mark the current level as completed on the client
  And I wait for 3 seconds
  And I reload the page
  And I verify progress in the header of the current page is "not_tried" for level 20
  And I wait for 3 seconds
  And I navigate to the course page for "hourofcode"
  And I verify progress for stage 1 level 20 is "not_tried"

Scenario: Progress on the server that is not on the client
  Given I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I wait for the page to fully load
  And I verify progress in the header of the current page is "not_tried" for level 20
  And I press "runButton"
  Then I am on "http://studio.code.org/hoc/reset"
  Then I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I verify progress in the header of the current page is "attempted" for level 20
  And I navigate to the course page for "hourofcode"
  And I verify progress for stage 1 level 20 is "attempted"

@no_mobile
Scenario: Go to puzzle 10, see video, go somewhere else, return to puzzle 10, should not see video
  Given I am on "http://studio.code.org/hoc/10"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I wait until element ".video-modal" is visible
  Then I close the dialog
  Then I am on "http://studio.code.org/hoc/11"
  Then I am on "http://studio.code.org/hoc/10"

Scenario: Go to puzzle 9, see callouts, go somewhere else, return to puzzle 9, should not see callouts
  Given I am on "http://studio.code.org/hoc/9?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".qtip-content:contains('Blocks that are grey')" is visible
  Then I am on "http://studio.code.org/hoc/10?noautoplay=true"
  Then I am on "http://studio.code.org/hoc/9?noautoplay=true"
  Then element ".qtip-content:contains('Blocks that are grey')" does not exist
