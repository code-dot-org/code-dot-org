@no_mobile
@dashboard_db_access
@as_student
Feature: App Lab Scenarios

  Scenario: Predictive free response level
    # A level that asks for a prediction using a contained free response level
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/15?noautoplay=true"
    And I rotate to landscape
    And I wait to see "#runButton"
    And I wait to see ".response"
    And element "#runButton" is disabled

    Then I type "test answer" into ".response"
    And element "#runButton" is enabled
    And I press "runButton"
    And element "#finishButton" is visible
    And I press "finishButton"
    And I wait to see ".congrats"
    And element ".congrats" is visible
