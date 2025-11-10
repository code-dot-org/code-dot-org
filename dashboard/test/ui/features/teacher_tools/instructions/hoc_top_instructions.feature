@eyes
@as_student
Feature: Eyes Tests for HOC Top Instructions

  Scenario: HOC Top Instructions
    When I open my eyes to test "top instructions in hoc"

    Then I am on "http://studio.code.org/courses/mc/units/1/lessons/1/levels/4?noautoplay=true"
    And I wait for the lab page to fully load
    And I see no difference for "minecraft top instructions" using stitch mode "none"

    Then I am on "http://studio.code.org/courses/starwars/units/1/lessons/1/levels/15?noautoplay=true"
    And I wait for the lab page to fully load
    And I see no difference for "starwars top instructions"

    Then I am on "http://studio.code.org/courses/frozen/units/1/lessons/1/levels/5?noautoplay=true"
    And I wait for the lab page to fully load
    And I see no difference for "frozen top instructions"

    And execute JavaScript expression "window.localStorage.clear()"
    And I close my eyes