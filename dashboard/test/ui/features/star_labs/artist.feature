Feature: Playing the Artist Game

Background:
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/3/levels/2?noautoplay=true"
  And I wait for the lab page to fully load
  And I dismiss the login reminder
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "video_thumbnails/C2_artist_intro"
  Then there's an image "artist/small_static_avatar"

Scenario: Winning the first level
  Then I've initialized the workspace with winning artist blocks
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".congrats" is visible
  And I press "continue-button"
  And I wait until I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/3/levels/3"

Scenario: Losing the first level
  Then I've initialized the workspace with losing artist blocks
  And I press "runButton"
  And element "#resetButton" is visible
  And I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" has escaped text "Not quite. Try using a block you aren’t using yet."
  And I press "resetButton"
  And element "#runButton" is visible
  And element "#resetButton" is hidden
