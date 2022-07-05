Feature: Finish Button

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/1?noautoplay=true"
  And I wait to see "#finishButton"

  Scenario: Finish button goes from disabled to enabled on run
    Then element "#finishButton" is disabled
    Then I press "runButton"
    Then I wait until element "#finishButton" is enabled