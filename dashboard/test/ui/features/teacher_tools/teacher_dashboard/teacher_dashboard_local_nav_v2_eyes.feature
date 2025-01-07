@no_mobile
@eyes
Feature: Using the V2 teacher dashboard local navigation - Eyes
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

  Scenario: Local navigation on Unit and Course overview pages
    When I open my eyes to test "teacher local nav v2 - unit/course overview"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" and unit "allthethings" with teacher "Teacher_Sally"

    Given I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access

    When I click selector "a:contains(New Section)" once I see it to load a new page

    Given I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Course')" once I see it

    And I wait until element "h1:contains('All the Things!')" is visible

    Then I see no difference for "unit overview"

    When I click selector "a:contains('allthethingscourse')" once I see it

    And I wait until element "h1:contains('allthethingscourse')" is visible

    Then I see no difference for "course overview"

    And I close my eyes

  Scenario: Local navigation on standalone Unit
    When I open my eyes to test "teacher local nav v2 - standalone unit overview"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "interactive-games-animations-2024" with teacher "Teacher_Sally"

    Given I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access

    When I click selector "a:contains(New Section)" once I see it to load a new page

    Given I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Course')" once I see it

    And I wait until element "h1:contains('Interactive Animations and Games')" is visible

    Then I see no difference for "unit overview"

    Then I click selector "#uitest-view-as-student" once I see it

    And I wait until element ".uitest-assigned" is visible

    Then I see no difference for "student view"

    Then I click selector "#uitest-view-as-teacher" once I see it

    Then I see no difference for "back to teacher"

    Then I select the "Sally" option in dropdown "uitest-view-as-student-selector"

    Then I see no difference for "selected student view"

    Then I select the "Me" option in dropdown "uitest-view-as-student-selector"

    Then I see no difference for "back to teacher 2"

    Then I click selector "button:contains('Assign to sections')" once I see it

    Then I see no difference for "assign to sections modal"

    And I close my eyes

  Scenario: Local navigation on the rest of the teacher dashboard pages
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