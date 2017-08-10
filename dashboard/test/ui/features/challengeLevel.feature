Feature: Challenge level shows different UI

Background:
  Given I am on "http://studio.code.org/reset_session"
  Given I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/6?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I close the instructions overlay if it exists
  And element ".csf-top-instructions p" contains text "This pig is ruffling my feathers"
  And I press "challengePrimaryButton"
  And I wait for the page to fully load

@eyes
Scenario: Submit a passing solution
  When I open my eyes to test "challenge level"
  Then I drag block "7" to block "5"
  Then I press "runButton"
  Then I wait until element "#challengeTitle" is visible
  And element "#challengeTitle" has text "You did it!"
  Then I press "challengeCancelButton"
  Then I wait until element ".modal-body" is not visible
  Then I press "resetButton"
  Then I drag block "6" to block "2"
  Then I press "runButton"
  Then I wait until element "#challengeTitle" is visible
  And element "#challengeTitle" has text "Challenge Complete!"
