@no_mobile
Feature: Using the V2 teacher dashboard local navigation
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"
    Given I use a cookie to mock the DCDO key "ai-tutor-teacher-nav-v2" as "false"

  Scenario: Modifying settings on the teacher dashboard
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" with teacher "Teacher_Sally" in a section named "All the Things Section"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access

    When I click selector "#task-button-View-progress-All-the-Things-Section" once I see it

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Settings')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "h1:contains('Settings')" is visible
    And I wait until element "h2:contains('Class Section')" is visible

    And I press the first "input[name='grades[]']" element

    And I click selector "button:contains(Middle School)" once I see it
    And I click selector "input[name='Interactive Animations and Games']" once I see it

    And I press backspace to clear element "#uitest-section-name-setup"
    And I press keys "Sally's Super Section" for element "#uitest-section-name-setup"

    And I click selector "button:contains(Save)" to load a new page

    And I wait until element "h1:contains(Progress)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible

    And I wait until element "#ui-test-skeleton-progress-column" is not visible

    And I wait until element "#unit-selector-v2" contains text "Interactive Animations and Games"
    Then element "#uitest-sidebar-section-dropdown" contains text "Sally's Super Section"
    Then element "#uitest-sidebar-section-dropdown" does not contain text "All the Things Section"

  Scenario: Single-unit course overview
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "ui-test-single-unit-course-2025" with teacher "Teacher_Sally" in a section named "Single Unit Section"

    Given I sign in as "Teacher_Sally" and go home

    When I click selector "#task-button-View-progress-Single-Unit-Section" once I see it

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Course')" once I see it
    Then check that the URL contains "/courses/ui-test-single-unit-course-2025/units/1"
    And I wait until element "h1:contains('Single Unit 2025')" is visible
    And I wait until element "#assignment-version-year" contains text "2025"
    And I wait until I don't see selector ".unit-breadcrumb"
