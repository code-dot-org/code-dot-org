Feature: Visiting a jigsaw page

Background:
  Given I am on "http://learn.code.org/s/course1/stage/3/puzzle/1?noautoplay=1"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 1 of 12"
  Then there's an image "instruction_gifs/drag-drop.gif"
  And I press "x-close"

@new_courses
Scenario: Loading the first jigsaw level
  Then there's an image "jigsaw/blank.png"

Scenario: Can't delete blocks
  Then the workspace has "1" blocks of type "jigsaw_2A"
  Then I drag block "1" to offset "-500, 0"
  # Block wasn't deleted
  And the workspace has "1" blocks of type "jigsaw_2A"
  # Make sure block was actually dragged
  And block "1" is at offset "-176, 20"

Scenario: Solving puzzle
  And I drag "[block-id=1]" to "rect[fill-opacity='0.2']"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 1"
