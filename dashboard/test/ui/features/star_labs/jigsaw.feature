Feature: Visiting a jigsaw page

Background:
  Given I am on "http://studio.code.org/s/course1/lessons/3/levels/1?noautoplay=1"
  And I wait for the lab page to fully load

Scenario: Loading the first jigsaw level
  Then there's an image "jigsaw/blank.png"

Scenario: Can't delete blocks or lose them outside the workspace
  Given the workspace has "1" blocks of type "jigsaw_2A"
  And block "jigsaw_2A" is at a location "start_position"

  When I drag block "jigsaw_2A" to offset "2000, 0"
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is not at location "start_position"
  And block "jigsaw_2A" is visible in the workspace

  When I drag block "jigsaw_2A" to offset "0, 2000"
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is visible in the workspace

  When I drag block "jigsaw_2A" to offset "-2000, 0"
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is visible in the workspace

  When I drag block "jigsaw_2A" to offset "0, -2000"
  Then block "jigsaw_2A" has not been deleted
  And block "jigsaw_2A" is visible in the workspace

Scenario: Solving puzzle
  And I drag "[data-id='jigsaw_2A']" to "rect[fill-opacity='0.2']"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1"
