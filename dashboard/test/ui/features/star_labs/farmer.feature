Feature: Playing the Farmer Game

Background:
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/6/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And I dismiss the login reminder
  And element ".instructions-markdown p" has escaped text "Wow, look at that! I don't know how many shovelfuls of dirt this hole needs.\nCan you write a program that keeps using the fill block until the ground is even?  "
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Loading the first level
  Then there's an image "farmer/small_static_avatar"
  Then I see "#pegman"

Scenario: Winning the first level
  And I've initialized the workspace with winning farmer blocks
  Then I press "runButton"
  And element "#resetButton" is visible
  Then I wait until element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 1."
  And there's 0 dirt at (3, 3)
  And I press "continue-button"
  Then I wait until I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/6/levels/2"

@no_mobile
Scenario: Losing the first level
  When I've initialized the workspace with losing farmer blocks
  And I press "runButton"
  And element "#resetButton" is visible
  Then I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" has escaped text "Not quite. Try using a block you aren’t using yet."
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
