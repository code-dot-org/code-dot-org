@playwright
Feature: Maze level tests for users that are signed out

Background:
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/reset"

Scenario: Solving a puzzle marks it perfect in the header and unit overview, and reset clears the saved progress and code
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And I've initialized the workspace with two move forward blocks
  And I press "runButton"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1."
  And I close the dialog
  ## Verify that closing doesn't redirect to the next level
  Then check that I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/1?noautoplay=true"
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/2?noautoplay=true"
  And I wait for the lab page to fully load
  And I verify progress in the header of the current page is "perfect" for level 1
  # Course overview should also show progress
  Then I navigate to the unit page for unit number "1" in course "ui-test-maze"
  And I verify progress for lesson 1 level 1 is "perfect"
  # Course overview in a different unit shouldn't show progress
  Then I am on "http://studio.code.org/courses/ui-test-artist/units/1/lessons/1/levels/2?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-artist/units/1/lessons/1/levels/2?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 1
  # Level source is saved
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/1?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And block "moveForward" is child of block "startBlock"
  # Level source is reset
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/reset"
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/1?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And element "g[data-id=\'startBlock\'] g[data-id=\'moveForward\']" does not exist

Scenario: Failing a puzzle and reloading marks it attempted in the header and unit overview
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And I press "runButton"
  Then I wait to see ".uitest-topInstructions-inline-feedback"
  Then I reload the page
  And I wait for the lab page to fully load
  And I verify progress in the header of the current page is "attempted" for level 1
  And I navigate to the unit page for unit number "1" in course "ui-test-maze"
  And I verify progress for lesson 1 level 1 is "attempted"

@no_mobile
Scenario: Video modal is shown once and does not reappear when returning to the puzzle
  # No noautoplay here: the modal only appears when the level video autoplays.
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3"
  Then I wait until element ".video-modal" is visible
  Then I close the dialog
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/4"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/4"
  And I wait for the lab page to fully load
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3"
  And I wait for the lab page to fully load
  Then I click selector ".reference_area a:last"

Scenario: Callout is shown once and does not reappear when returning to the puzzle
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/4?noautoplay=true"
  And I wait for the lab page to fully load
  Then element ".qtip-content:contains('Blocks that are grey')" is visible
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3?noautoplay=true"
  And I wait for the lab page to fully load
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/4?noautoplay=true"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/4?noautoplay=true"
  And I wait for the lab page to fully load
  Then element ".qtip-content:contains('Blocks that are grey')" does not exist
