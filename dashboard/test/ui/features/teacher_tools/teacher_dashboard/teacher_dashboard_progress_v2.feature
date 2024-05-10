@no_mobile
Feature: Using the V2 teacher dashboard

  @eyes
  Scenario: Teacher can view choice levels
    And I open my eyes to test "V2 Progress - Choice Levels"

    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"

    # Student submits choice level
    Given I am on "http://studio.code.org/s/allthethings/lessons/40/levels/1/sublevel/2"
    Then I wait until I see selector "button:contains(Submit)"
    And I click selector "button:contains(Submit)"
    Then I wait to see "#confirm-button"
    And I press "confirm-button"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I navigate to the V2 progress dashboard

    # View unexpanded choice level
    And I wait until element "#ui-test-lesson-header-1" is visible
    And I scroll to "#ui-test-lesson-header-40"
    And I click selector "#ui-test-lesson-header-40"
    Then I wait until I see selector "button:contains(40.1)"
    And I see no difference for "unexpanded choice level"

    # View expanded choice level
    And I click selector "button:contains(40.1)"
    Then I wait until I see selector "button:contains(b)"
    And I see no difference for "expanded choice level"

    # View expanded choice level
    And I click selector "button:contains(b)"
    And I see no difference for "unexpanded choice level - closed"

