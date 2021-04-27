Feature: Challenge level shows different dialogs

Background:
  Given I am on "http://studio.code.org/reset_session"
  Given I am on "http://studio.code.org/s/allthethings/lessons/2/levels/6?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

Scenario: Submit passing and perfect solutions
  Given I wait until element "#uitest-challenge-title" is visible
  Then element "#uitest-challenge-title" has text "Challenge Puzzle!"
  Given I press "challengePrimaryButton"
  And I drag block "7" to block "5"
  When I press "runButton"
  And I wait until element "#uitest-challenge-title" is visible
  Then element "#uitest-challenge-title" has text "You did it!"
  Given I press "challengeCancelButton"
  And I wait until element ".modal-body" is not visible
  And I press "resetButton"
  And I drag block "6" to block "2"
  When I press "runButton"
  And I wait until element "#uitest-challenge-title" is visible
  Then element "#uitest-challenge-title" has text "Challenge Complete!"

Scenario: Press the skip button
  Given I press "challengePrimaryButton"
  When I press "skipButton"
  Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/2/levels/7"
