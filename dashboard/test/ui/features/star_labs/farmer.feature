Feature: Playing the Farmer Game

Background:
  Given I am on "http://studio.code.org/s/20-hour/lessons/9/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  And element ".instructions-markdown p" has text "Hi, I'm a farmer. I need your help to flatten the field on my farm so it's ready for planting. Move me to the pile of dirt and use the \"remove\" block to remove it."
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "video_thumbnails/farmer_intro"
  Then there's an image "farmer/small_static_avatar"
  Then I see "#pegman"
  Then there's 1 dirt at (4, 4)

Scenario: Winning the first level
  And I drag block "1" to block "6"
  And I drag block "1" to block "7"
  And I drag block "1" to block "8"
  And I drag block "4" to block "9"
  And there's 1 dirt at (4, 4)
  Then I press "runButton"
  And element "#resetButton" is visible
  Then I wait until element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 1."
  And there's 0 dirt at (4, 4)
  And I press "continue-button"
  Then I wait until I am on "http://studio.code.org/s/20-hour/lessons/9/levels/2"

@no_mobile
Scenario: Losing the first level
  When I drag block "1" to block "6"
  And I press "runButton"
  And element "#resetButton" is visible
  Then I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" has escaped text "Not quite. You have to use a block you aren’t using yet."
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
