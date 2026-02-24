Feature: Complete a complicated maze level

Background:
  Given I am on "http://studio.code.org/reset_session"
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/5?noautoplay=true"
  And I wait for the lab page to fully load
  And I dismiss the login reminder
  And element ".csf-top-instructions p" has text "Use the if block to help me decide when to turn. "

@no_mobile
Scenario: Submit an invalid solution
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And I press "runButton"
  Then element "#runButton" is hidden
  And element "#resetButton" is visible
  Then I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

@no_mobile
Scenario: Submit a valid solution
  When I wait for the lab page to fully load
  Then element "#resetButton" is hidden
  Then I've initialized the workspace with valid maze blocks
  Then I press "runButton"
  Then I wait until element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 5."

  And I press "continue-button"
  Then I wait until I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/6"
  Then check that level 6 on this lesson is done
  Then check that level 5 on this lesson is not done

  # Make sure the work on level 5 was saved.
  When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/5?noautoplay=true"
  And I wait for the lab page to fully load
  Then I press "runButton"
  Then I wait until element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 5."
