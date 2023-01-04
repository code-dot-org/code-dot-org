# We don't support Java Lab on mobile.
@no_circle @no_phone
Feature: Finish Button

Background:
  Given I create a student named "Lillian" in a CSA section

  Scenario: Finish button goes from disabled to enabled on run
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/1?noautoplay=true"
    And I wait to see "#finishButton"
    Then element "#finishButton" is disabled
    Then I press "runButton"
    Then I wait until element "#finishButton" is enabled

  Scenario: Finish button does not become enabled if tests fail
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/11?noautoplay=true"
    And I wait to see "#finishButton"
    Then I press "testButton"
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    Then element "#finishButton" is disabled

  Scenario: Finish button becomes enabled if tests succeed
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/12?noautoplay=true"
    And I wait to see "#finishButton"
    Then I press "testButton"
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    Then element "#finishButton" is enabled
