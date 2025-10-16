@no_mobile
@eyes
Feature: Calendar page - Eyes

  Scenario: Lesson materials page
    When I open my eyes to test "calendar page"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "interactive-games-animations-2024" unit 1 with teacher "Teacher_Sally"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

    When I click selector "#task-button-View-progress-New-Section" once I see it

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Calendar')" once I see it
    And I wait until element "#uitest-spinner" is not visible

    And I wait until element "div:contains('Instructional minutes per week')" is visible
    And I wait until element "div:contains('Lesson 1: Programming for a Purpose')" is visible

    Then I see no difference for "calendar"

    And I close my eyes
