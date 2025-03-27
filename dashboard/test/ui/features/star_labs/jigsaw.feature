Feature: Visiting a jigsaw page

Background:
  Given I am on "http://studio.code.org/s/course1/lessons/3/levels/1?noautoplay=1"
  And I wait for the lab page to fully load

Scenario: Loading the first jigsaw level
  Then there's an image "jigsaw/blank.png"

Scenario: Can't delete blocks or lose them outside the workspace
  Given the workspace has "1" blocks of type "jigsaw_2A"
  And block "jigsaw_2A" is at a location "start_position"

  When I move block "jigsaw_2A" to right edge of workspace
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is not at location "start_position"
  And block "jigsaw_2A" is visible in the workspace

  When I move block "jigsaw_2A" to bottom edge of workspace
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is visible in the workspace

  When I move block "jigsaw_2A" to left edge of workspace
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is visible in the workspace

  When I move block "jigsaw_2A" to top edge of workspace
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is visible in the workspace

Scenario: Solving puzzle
  And I move block "jigsaw_2A" to jigsaw ghost
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1"
