@no_mobile
@as_student
Feature: App Lab Data Blocks

  Scenario: Evaluate Data Blocks
    # This level evaluates the create/read/update/deleteRecord and set/getKeyValue blocks
    # when run, and prints success if the data storage APIs are working properly.
    Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/8?noautoplay=true"
    And I wait for the lab page to fully load
    And element "#runButton" is visible
    And I open the debug console
    Then I press "runButton"
    And I wait until element "#keyValueLabel" is visible within element "#divApplab"
    And I wait until element "#recordLabel" is visible within element "#divApplab"