@no_mobile
@eyes
Feature: Using the V2 progress page with V2 local navigation - Eyes
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

  Scenario: Local navigation on Progress v2
    When I open my eyes to test "teacher local nav v2 - progress"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"

    And I am on "http://studio.code.org/s/allthethings/lessons/10/levels/1?noautoplay=true"
    Then I wait for 3 seconds
    And I wait until element ".submitButton" is visible
    And I press ".answerbutton[index=1]" using jQuery
    And I press ".answerbutton[index=0]" using jQuery
    And I press ".submitButton:first" using jQuery
    And I wait to see ".modal"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access

    And I create a new student section assigned to "interactive-games-animations-2024" and save the section
    Given I create a student named "Talia"
    And I join the section

    When I sign in as "Teacher_Sally" and go home

    When I click selector "a:contains(Untitled Section)" once I see it to load a new page

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    And I wait until element "h6:contains(Icon Key)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible

    And I wait until element "#ui-test-skeleton-progress-column" is not visible
    And I scroll to "#ui-test-lesson-header-10"

    Then I see no difference for "progress v2 - first section"

    Then I select the "New Section" option in dropdown "uitest-sidebar-section-dropdown"

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    And I wait until element "h6:contains(Icon Key)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible

    And I wait until element "#ui-test-skeleton-progress-column" is not visible

    Then I see no difference for "progress v2 - second section"

    And I close my eyes