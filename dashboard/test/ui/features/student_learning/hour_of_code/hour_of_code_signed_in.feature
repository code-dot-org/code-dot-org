@as_student
Feature: Hour of Code tests for users that are signed in

Scenario:
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/4?noautoplay=true"
  And I wait for the lab page to fully load
  And I've initialized the workspace with two move forward blocks
  And I press "runButton"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 4."
  And I press "continue-button"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/5"
  And I wait for the lab page to fully load
  And I verify progress in the header of the current page is "perfect" for level 4
  # Course overview should also show progress
  Then I navigate to the unit page for unit number "1" in course "ui-test-csf"
  And I verify progress for lesson 1 level 4 is "perfect"
  # Course overview in a different unit shouldn't show progress
  Then I am on "http://studio.code.org/courses/ui-test-artist/units/1/lessons/1/levels/2?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 4
  # Level source is saved
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/4?noautoplay=true"
  And I wait for the lab page to fully load
  And block "moveForward" is child of block "startBlock"
  # Level source is reset
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/reset"
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/4?noautoplay=true"
  And I wait for the lab page to fully load
  And block "moveForward" is child of block "startBlock"

Scenario: Failing at puzzle 5, refreshing puzzle 5, bubble should show up as attempted
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/5?noautoplay=true"
  And I wait for the lab page to fully load
  And I press "runButton"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  Then I reload the page
  And I wait for the lab page to fully load
  Then I verify progress in the header of the current page is "attempted" for level 5

Scenario: Progress on the server that is not on the client
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/5?noautoplay=true"
  And I wait for the lab page to fully load
  And I verify progress in the header of the current page is "not_tried" for level 5
  And I press "runButton"
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/reset"
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/5?noautoplay=true"
  And I verify progress in the header of the current page is "attempted" for level 5
  And I navigate to the unit page for unit number "1" in course "ui-test-csf"
  And I verify progress for lesson 1 level 5 is "attempted"

@no_mobile
Scenario: Go to puzzle 6, see video, go somewhere else, return to puzzle 6, should not see video
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/6"
  And I wait for the lab page to fully load
  Then I wait until element ".video-modal" is visible
  Then I close the dialog
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/7"
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/6"

Scenario: Go to puzzle 7, see callouts, go somewhere else, return to puzzle 7, should not see callouts
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/7?noautoplay=true"
  And I wait for the lab page to fully load
  Then element ".qtip-content:contains('Blocks that are grey')" is visible
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/6?noautoplay=true"
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/7?noautoplay=true"
  Then element ".qtip-content:contains('Blocks that are grey')" does not exist
