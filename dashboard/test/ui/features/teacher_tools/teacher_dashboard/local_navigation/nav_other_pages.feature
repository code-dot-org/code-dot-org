@no_mobile
@eyes
Feature: V2 teacher dashboard local navigation for misc pages - Eyes
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

  Scenario: Local navigation on misc teacher dashboard pages
    When I open my eyes to test "teacher local nav v2 - other pages"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" and unit "allthethings" with teacher "Teacher_Sally"

    Given I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access

    When I click selector "a:contains(New Section)" once I see it to load a new page

    Given I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Assessments')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "h2:contains('Submission status')" is visible
    Then I see no difference for "assessments page"

    Given I click selector "#ui-test-teacher-sidebar a:contains('Student Projects')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "span:contains('Filter by student:')" is visible
    Then I see no difference for "projects page"

    Given I click selector "#ui-test-teacher-sidebar a:contains('Stats')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "span:contains('Completed Levels')" is visible
    Then I see no difference for "stats page"

    Given I click selector "#ui-test-teacher-sidebar a:contains('Text Responses')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    Then I see no difference for "test responses page"

    Given I click selector "#ui-test-teacher-sidebar a:contains('Roster')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "span:contains('Display name')" is visible
    Then I see no difference for "roster page"

    Given I click selector "#ui-test-teacher-sidebar a:contains('Settings')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "h1:contains('Edit Section Details')" is visible
    Then I see no difference for "settings page"

    And I close my eyes