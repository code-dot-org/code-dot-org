@no_mobile
Feature: Using the Lesson Edit Page

  Scenario: View the script edit gui page
    Given I create a levelbuilder named "Levi"
    And I create a temp script
    And I view the temp script overview page
    And I view the temp script gui edit page
    And I delete the temp script
