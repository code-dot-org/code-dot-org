Feature: Challenge level shows different dialogs

Background:
  Given I am on "http://studio.code.org/reset_session"
  Given I am on "http://studio.code.org/s/allthethings/lessons/2/levels/6?noautoplay=true"
  And I wait for the lab page to fully load

Scenario: Submit passing and perfect solutions
  Given I wait until element "#uitest-challenge-title" is visible
  Then element "#uitest-challenge-title" has text "Challenge Puzzle!"
  Given I press "challengePrimaryButton"
  And I connect block "stoneTurn" to block "stoneMoveTop"
  When I press "runButton"
  And I wait until element "#uitest-challenge-title" is visible
  Then element "#uitest-challenge-title" has text "You did it!"
  Given I press "challengeCancelButton"
  And I wait until element ".modal-body" is not visible
  And I press "resetButton"
  And I delete block "extraBlock"
  When I press "runButton"
  And I wait until element "#uitest-challenge-title" is visible
  Then element "#uitest-challenge-title" has text "Challenge Complete!"

Scenario: Press the skip button
  Given I press "challengePrimaryButton"
  When I press "skipButton"
  Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/2/levels/7"
