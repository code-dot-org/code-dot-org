Feature: Playing the Artist Game

Background:
  Given I am on "http://studio.code.org/s/20-hour/stage/5/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I close the instructions overlay if it exists
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "video_thumbnails/2"
  Then there's an image "artist/small_static_avatar"

Scenario: Winning the first level
  Then I drag block "2" to block "4"
  And I drag block "1" to block "5"
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".congrats" is visible
  And I press "continue-button"
  And I wait until I am on "http://studio.code.org/s/20-hour/stage/5/puzzle/2"

Scenario: Losing the first level
  Then I drag block "2" to block "4"
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" has text "Keep coding! Something's not quite right yet."
  And I press "resetButton"
  And element "#runButton" is visible
  And element "#resetButton" is hidden
