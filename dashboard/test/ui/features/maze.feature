Feature: Complete a complicated maze level

Background:
  Given I am on "http://learn.code.org/reset_session"
  Given I am on "http://learn.code.org/s/1/level/16?noautoplay=true"
  And I rotate to landscape
  And I wait for 2 seconds
  Then element ".dialog-title" has text "Puzzle 15 of 20"
  And element ".modal-content p:nth-child(2)" has text "Ok, this is just like the last puzzle, but you need to remember how you used the \"if\" block and the \"repeat\" block together."
  And element "#prompt" has text "Ok, this is just like the last puzzle, but you need to remember how you used the \"if\" block and the \"repeat\" block together."

@no_mobile
Scenario: Submit an invalid solution
  When I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  And I press "runButton"
  Then element "#runButton" is hidden
  And element "#resetButton" is visible
  Then I wait until element ".congrats" is visible
  # Skipping due to failing on test.learn.code.org environment
  #   TODO (espertus/bjordan): fix or change level this applies to
  # And element ".congrats" has text "You need an \"if\" block inside a \"repeat\" block. If you're having trouble, try the previous level again to see how it worked."
  # todo (brent): could also try the back button, and validate that clicking outside of the dialog closes it
  Then I press "again-button"
  And I press "resetButton"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

@no_mobile
Scenario: Submit a valid solution
  When I press "x-close"
  Then I wait until element "#runButton" is visible
  And element "#resetButton" is hidden
  Then I drag block "4" to block "6"
  And I drag block "1" to block "7" plus offset 35, 50
  Then block "8" is child of block "7"
  Then I drag block "5" to block "8"
  And block "9" is child of block "8"
  Then I drag block "3" to block "9" plus offset 35, 30
  And block "10" is child of block "9"
  Then I press "runButton"
  Then I wait until element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 15."

  # todo (brent) : could test show code
  And I press "continue-button"
  And I wait for 2 seconds
  Then check that I am on "http://learn.code.org/s/1/level/17"
  Then check that level 16 on this stage is done
  Then check that level 15 on this stage is not done
