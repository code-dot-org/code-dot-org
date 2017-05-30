@no_mobile
@dashboard_db_access
@as_student
Feature: App Lab Data Blocks

  Scenario: Evaluate Data Blocks without Firebase
    # This level evaluates the create/read/update/deleteRecord and set/getKeyValue blocks
    # when run, and prints success if the data storage APIs are working properly.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/8?noautoplay=true&noUseFirebase=1"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And Firebase is disabled
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"

  Scenario: Evaluate onRecordEvent block without Firebase
    # The level verifies that onRecordEvent captures the correct events when
    # the create/update/deleteRecord blocks are evaluated, then prints success.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/13?noautoplay=true&noUseFirebase=1"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And Firebase is disabled
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"

  Scenario: Evaluate Data Blocks with Firebase
    # This level evaluates the create/read/update/deleteRecord and set/getKeyValue blocks
    # when run, and prints success if the data storage APIs are working properly.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/8?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And Firebase is enabled
    And I open the debug console
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"

  Scenario: Evaluate onRecordEvent block with Firebase
    # The level verifies that onRecordEvent captures the correct events when
    # the create/update/deleteRecord blocks are evaluated, then prints success.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/13?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And Firebase is enabled
    And I open the debug console
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"
