Feature: Playing the Artist Game

Background:
  Given I am on "http://learn.code.org/s/1/level/24?noautoplay=true"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 1 of 10"
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "video_thumbnails/2"
  Then there's an image "artist/small_static_avatar"

Scenario: Winning the first level
  And I drag block "2" to block "4"
  And I drag block "1" to block "5"
  Then I press "runButton"
  And element "#resetButton" is visible
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I press "continue-button"
  And I wait to see "#x-close"
  And element ".dialog-title" has text "Puzzle 2 of 10"
  Then check that I am on "http://learn.code.org/s/1/level/25"

Scenario: Losing the first level
  And I drag block "2" to block "4"
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "You are using all of the necessary types of blocks, but try using more  of these types of blocks to complete this puzzle."
  And there's an image "artist/failure_avatar"
  And I press "again-button"
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
