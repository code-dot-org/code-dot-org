@no_ie9
@no_mobile
@dashboard_db_access
@as_student
Feature: App Lab Data Blocks

  Background:
    # This level evaluates the create/read/update/deleteRecord and set/getKeyValue blocks
    # when run, and prints success if the data storage APIs are working properly.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/8?noautoplay=true"
    And I rotate to landscape
    And I wait to see "#runButton"
    And element "#runButton" is visible

  Scenario: Evaluate Data Blocks
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"
