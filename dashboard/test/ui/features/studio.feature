Feature: Visiting a studio page

@new_courses
@no_mobile
Scenario: Using a studio dropdown
  Given I am on "http://learn.code.org/s/course1/stage/16/puzzle/2"
  And I rotate to landscape
  And I close the dialog
  Then there's an SVG image "studio/dog_thumb.png"
  Then there's not an SVG image "studio/cat_thumb.png"
  And I drag block "1" to block "2"
  And I press the image dropdown
  Then there's a div with a background image "studio/cat_thumb.png"
  Then there's a div with a background image "studio/dog_thumb.png"
  And I press dropdown item "1"
  And I drag block "1" to block "3"
  Then I press "runButton"
  And element "#resetButton" is visible
  And I wait to see ".congrats"
  And element ".congrats" is visible

Scenario: Resizing Sprites
  Given I am on "http://learn.code.org/s/allthethings/stage/21/puzzle/1?noautoplay=true"
  And I rotate to landscape
  #And I close the dialog

  Then the 0th sprite image has height "100"
  And the 15th sprite image has height "100"

  When I press "runButton"
  And I press "again-button"
  Then the 0th sprite image has height "50"
  And the 15th sprite image has height "150"
