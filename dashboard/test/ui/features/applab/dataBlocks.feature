@no_mobile
@dashboard_db_access
@as_student
Feature: App Lab Data Blocks

  Scenario: Evaluate Data Blocks
    # This level evaluates the create/read/update/deleteRecord and set/getKeyValue blocks
    # when run, and prints success if the data storage APIs are working properly.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/8?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And I open the debug console
    Then I press "runButton"
    And I wait until element "#keyValueLabel" is visible within element "#divApplab"
    And I wait until element "#recordLabel" is visible within element "#divApplab"

  Scenario: Evaluate onRecordEvent block
    # The level verifies that onRecordEvent captures the correct events when
    # the create/update/deleteRecord blocks are evaluated, then prints success.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/13?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And I open the debug console
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"
