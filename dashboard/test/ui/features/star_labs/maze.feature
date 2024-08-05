Feature: Complete a complicated maze level

Background:
  Given I am on "http://studio.code.org/reset_session"
  Given I am on "http://studio.code.org/s/20-hour/lessons/2/levels/15?noautoplay=true"
  And I wait for the lab page to fully load
  And I dismiss the login reminder
  And element ".csf-top-instructions p" has text "Ok, this is just like the last puzzle, but you need to remember how you used the \"if\" block and the \"repeat\" block together."

@no_mobile
Scenario: Submit an invalid solution
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And I press "runButton"
  Then element "#runButton" is hidden
  And element "#resetButton" is visible
  Then I wait until element ".uitest-topInstructions-inline-feedback" is visible
  # Skipping due to failing on test.studio.code.org environment
  #   TODO (espertus/bjordan): fix or change level this applies to
  # And element ".congrats" has text "You need an \"if\" block inside a \"repeat\" block. If you're having trouble, try the previous level again to see how it worked."
  # could also try the back button, and validate that clicking outside of the dialog closes it
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

@no_mobile
Scenario: Submit a valid solution
  When I wait for the lab page to fully load
  Then element "#resetButton" is hidden
  Then I drag block "repeatForever" to block "topBlock"
  And I drag block "moveForward" into first position in repeat block "repeatForever"
  Then block "moveForward" is child of block "repeatForever"
  Then I drag block "ifPathRight" to block "moveForward"
  And block "ifPathRight" is child of block "moveForward"
  Then I drag block "turnRight" to block "ifPathRight" plus offset 35, 30
  And block "turnRight" is child of block "ifPathRight"
  Then I press "runButton"
  Then I wait until element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 15."

  And I press "continue-button"
  Then I wait until I am on "http://studio.code.org/s/20-hour/lessons/2/levels/16"
  Then check that level 16 on this lesson is done
  Then check that level 15 on this lesson is not done

  # Make sure the work on level 15 was saved.
  When I am on "http://studio.code.org/s/20-hour/lessons/2/levels/15?noautoplay=true"
  And I wait for the lab page to fully load
  Then I press "runButton"
  Then I wait until element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 15."
