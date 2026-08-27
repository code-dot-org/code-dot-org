@no_mobile
@no_ci
Feature: Javalab Unverified Teacher

  Scenario: Unverified teacher is told to get verified
    Given I create a teacher named "Ms_Frizzle"
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/44/levels/4"
    And I wait for the lab page to fully load
    And I dismiss the teacher panel
    When I press "runButton"
    Then I wait until element ".javalab-console" contains text "To run your code in Java Lab, you need to become"
