Feature: Visiting a studio page

@new_courses
@no_mobile
Scenario: Using a studio dropdown
  Given I am on "http://learn.code.org/s/course1/stage/16/puzzle/2"
  And I rotate to landscape
  And I press "x-close"
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
