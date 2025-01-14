Feature: Visiting a studio page

@no_mobile
Scenario: Using a studio dropdown
  Given I am on "http://studio.code.org/s/course1/lessons/16/levels/2?blocklyVersion=google"
  And I wait for the lab page to fully load
  And I dismiss the login reminder
  Then there's an SVG image "studio/dog_thumb.png"
  Then there's not an SVG image "studio/cat_thumb.png"
  And I drag block "actorSay" to block "whenRun"
  And I show the editor of field "SPRITE" of block "actorSay"
  Then there's an element with an image "studio/cat_thumb.png"
  Then there's an element with an image "studio/dog_thumb.png"
  And I update the field "SPRITE" dropdown to "1"
  And I drag block "actorSay" to block "actorSay" plus offset 0, 10
  Then I press "runButton"
  And element "#resetButton" is visible
  And I wait to see ".uitest-topInstructions-inline-feedback"
  And element ".uitest-topInstructions-inline-feedback" is visible

Scenario: Resizing Sprites
  Given I am on "http://studio.code.org/s/allthethings/lessons/22/levels/1?noautoplay=true"
  And I wait for the lab page to fully load

  Then the 0th sprite image has height "100"
  And the 15th sprite image has height "100"

  When I press "runButton"
  Then I wait to see a ".congrats"
  And I press "again-button"
  Then the 0th sprite image has height "50"
  And the 15th sprite image has height "150"
