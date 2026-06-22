@eyes
@as_student
Feature: Eyes Tests for HOC Top Instructions

  Scenario: HOC Top Instructions
    When I open my eyes to test "top instructions in hoc"

    Then I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/25/levels/1?noautoplay=true"
    And I wait for the lab page to fully load
    And I see no difference for "minecraft top instructions"

    Then I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/24/levels/1?noautoplay=true"
    And I wait for the lab page to fully load
    And I see no difference for "starwars top instructions"

    Then I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/3/levels/10?noautoplay=true"
    And I wait for the lab page to fully load
    And I see no difference for "frozen top instructions"

    And execute JavaScript expression "window.localStorage.clear()"
    And I close my eyes