@no_mobile
@eyes
Feature: Lesson materials page - Eyes

  Scenario: Lesson materials page
    When I open my eyes to test "lesson materials"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" and unit "allthethings" with teacher "Teacher_Sally"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

    When I click selector "a:contains(New Section)" once I see it to load a new page

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    Then I click selector "#ui-test-teacher-sidebar a:contains('Lesson Materials')" once I see it

    Then I wait until element "h1:contains('Lesson Materials')" is visible
    Then I wait until element "h6:contains('Teacher Resources')" is visible

    And I see no difference for "lesson materials"

    And I select the "Lesson 48 — AI Rubrics" option in dropdown "ui-test-lessons-in-assigned-unit-dropdown"
    And I wait until element "p:contains('Lesson Plan: AI Rubrics')" is visible

    And I see no difference for "lesson materials - lesson 48"

    And I click selector "a:contains('Lesson Plan: AI Rubrics')" to load a new tab
    And I wait until element "h1:contains('Lesson 48: AI Rubrics')" is visible
    And I am on "http://studio.code.org/s/allthethings/lessons/48"

    And I close my eyes
