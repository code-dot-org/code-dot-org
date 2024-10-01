Feature: Playing the Artist Game

Background:
  Given I am on "http://studio.code.org/s/20-hour/lessons/5/levels/1?noautoplay=true&blocklyVersion=google"
  And I wait for the lab page to fully load
  And I dismiss the login reminder
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "video_thumbnails/artist_intro"
  Then there's an image "artist/small_static_avatar"

Scenario: Winning the first level
  Then I drag block "turnRight" to block "startBlock"
  And I drag block "moveForward" to block "turnRight"
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".congrats" is visible
  And I press "continue-button"
  And I wait until I am on "http://studio.code.org/s/20-hour/lessons/5/levels/2"

Scenario: Losing the first level
  Then I drag block "turnRight" to block "startBlock"
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" has escaped text "Keep coding! Something's not quite right yet."
  And I press "resetButton"
  And element "#runButton" is visible
  And element "#resetButton" is hidden
