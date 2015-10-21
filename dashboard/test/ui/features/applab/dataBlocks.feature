@no_ie
@dashboard_db_access
Feature: App Lab Data Blocks

  Background:
    Given I sign in as a student
    And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/8?noautoplay=true"
    And I rotate to landscape
    And element "#runButton" is visible

  Scenario: Evaluate Data Blocks
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"
