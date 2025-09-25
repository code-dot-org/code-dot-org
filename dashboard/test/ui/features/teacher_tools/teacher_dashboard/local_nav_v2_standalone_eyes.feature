@no_mobile
@eyes
Feature: V2 teacher dashboard local navigation - single-unit course - Eyes
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

  Scenario: Local navigation on single-unit course
    When I open my eyes to test "teacher local nav v2 - single-unit course overview"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "interactive-games-animations-2024" unit 1 with teacher "Teacher_Sally"

    Given I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access

    When I click selector "#task-button-View-progress-New-Section" once I see it
    Given I wait until element "#ui-test-teacher-sidebar" is visible
    Given I click selector "#ui-test-teacher-sidebar a:contains('Course')" once I see it
    And I wait until element "h1:contains('Interactive Animations and Games')" is visible
    Then I see no difference for "unit overview"

    Then I click selector "#uitest-view-as-student" once I see it
    And I wait until element ".uitest-assigned" is visible
    Then I see no difference for "student view"

    And I close my eyes
