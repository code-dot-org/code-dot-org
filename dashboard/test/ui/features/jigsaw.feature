Feature: Visiting a jigsaw page

Background:
  Given I am on "http://learn.code.org/s/course1/stage/3/puzzle/1?noautoplay=1"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 1 of 12"
  Then there's an image "instruction_gifs/drag-drop.gif"
  And I close the dialog

@new_courses
Scenario: Loading the first jigsaw level
  Then there's an image "jigsaw/blank.png"

Scenario: Can't delete blocks or lose them outside the workspace
  Given the workspace has "1" blocks of type "jigsaw_2A"
  And block "1" is at a location "start_position"

  When I drag block "1" to offset "2000, 0"
  Then block "1" has not been deleted
  And block "1" is not at location "start_position"
  And block "1" is visible in the workspace

  When I drag block "1" to offset "0, 2000"
  Then block "1" has not been deleted
  And block "1" is visible in the workspace

  When I drag block "1" to offset "-2000, 0"
  Then block "1" has not been deleted
  And block "1" is visible in the workspace

  When I drag block "1" to offset "0, -2000"
  Then block "1" has not been deleted
  And block "1" is visible in the workspace

Scenario: Solving puzzle
  And I drag "[block-id=1]" to "rect[fill-opacity='0.2']"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1"
