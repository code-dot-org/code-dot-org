@no_ie
@no_mobile
Feature: (Un)Assign on script and course overview pages

  Background:
    Given I create a teacher named "Frizzle"
    Then I am on "http://studio.code.org/s/coursea-2019?enableExperiments=assignmentUpdates"
    Then I am on "http://studio.code.org/home"
    And I create a new section named "assigned CSP1" assigned to "Computer Science Principles" version "'17-'18"
    Then the section table should have 1 row

  Scenario: Assignment on script and course overview for teacher
    And I save the section id from row 0 of the section table
    When I click selector ".uitest-owned-sections a:contains('Computer Science Principles')" to load a new page
    Then the url contains the section id
    And check that the URL contains "courses/csp-2017"
    And I wait until element ".uitest-CourseScript" is visible
    And I wait until element ".uitest-unassign-button" is visible
    And I wait until element ".uitest-assigned" is visible
    # One assign button for each of 8 currently unassigned units in this course.
    Then the overview page contains 8 assign buttons
    And I press the first ".uitest-unassign-button" element
    And I wait until element ".uitest-assigned" is not visible
    # One assign button for each of 9 currently unassigned units in this course,
    # and one at the top of the page indicating the course is assigned.
    Then the overview page contains 10 assign buttons
    And I press the first ".uitest-assign-button" element
    And I wait until element ".uitest-unassign-button" is visible
    # One assign button for each of 9 currently unassigned units in this course.
    Then the overview page contains 9 assign buttons
    And I press the first ".uitest-go-to-unit-button" element to load a new page
    And check that the URL contains "s/csp1-2017"
    Then the url contains the section id
    And I wait until element ".uitest-assign-button" is visible
    And I press the first ".uitest-assign-button" element
    And I wait until element ".uitest-unassign-button" is visible

  Scenario: Assignment on script and course overview for student
    And I save the section url
    Given I create a student named "Arnold"
    Then I am on "http://studio.code.org/s/coursea-2019?enableExperiments=assignmentUpdates"
    And I join the section
    Then I am on "http://studio.code.org/courses/csp-2017"
    And I wait until element ".uitest-CourseScript" is visible
    And I wait until element ".uitest-unassign-button" is not visible
    And I wait until element ".uitest-assigned" is visible
    And I press the first ".uitest-go-to-unit-button" element to load a new page
    And check that the URL contains "s/csp1-2017"
    And I wait until element ".uitest-unassign-button" is not visible
    And I wait until element ".uitest-assigned" is visible
