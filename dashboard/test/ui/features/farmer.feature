Feature: Playing the Farmer Game

Background:
  Given I am on "http://learn.code.org/s/1/level/47?noautoplay=true"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 1 of 11"
  And element ".modal-content p:nth-child(2)" has text "Hi, I'm a farmer. I need your help to flatten the field on my farm so it's ready for planting. Move me to the pile of dirt and use the \"remove\" block to remove it."
  And I see "#x-close"
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "video_thumbnails/3"
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
  Then I see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 1."
  And there's 0 dirt at (4, 4)
  And I press "continue-button"
  Then I see "#x-close"
  And element ".dialog-title" has text "Puzzle 2 of 11"
  Then check that I am on "http://learn.code.org/s/1/level/48"

@no_mobile
Scenario: Losing the first level
  When I drag block "1" to block "6"
  And I press "runButton"
  And element "#resetButton" is visible
  Then I see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Try one or more of the blocks below to solve this puzzle."
  Then I see "#feedbackBlocks"
  And there's an image "farmer/failure_avatar.png"
  And I press "again-button"
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
