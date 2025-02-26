@no_mobile
Feature: Using the teacher dashboard
  Scenario: Visiting student name URLs in teacher dashboard
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    When I click selector "a:contains(Untitled Section)" once I see it to load a new page
    And I wait until element "#ui-test-toggle-progress-view" is visible
    And I click selector "#ui-test-toggle-progress-view"
    And I wait until element "#uitest-teacher-dashboard-nav" is visible
    And check that the URL contains "/teacher_dashboard/sections/"
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I wait until element "a:contains(Sally)" is visible
    When I click selector "a:contains(Sally)" to load a new page
    And I wait until element "#teacher-panel-container" is visible
    And check that the URL contains "/s/allthethings"
    And check that the URL contains "viewAs=Instructor"

  Scenario: Attempt to join a section you own redirects to dashboard with error message
    Given I am a teacher
    And I create a new student section and go home
    And I attempt to join the section
    Then I wait until element "div.alert" is visible
    And element "div.alert" contains text matching "Sorry, you can't join your own section"

  Scenario: Attempt to join an invalid section through the homepage
    Given I am a teacher and go home
    And I wait until element "button.ui-test-join-section" is visible
    And I press keys "INVALID" for element "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then I wait until element ".announcement-notification" is visible
    And element ".announcement-notification" contains text matching "Section INVALID doesn't exist"

  Scenario: Attempt to join a section you own from teacher dashboard provides notification
    Given I am a teacher
    And I create a new student section and go home
    And I wait until element "button.ui-test-join-section" is visible
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then I wait until element ".announcement-notification" is visible
    And element ".announcement-notification" contains text matching "You are already an instructor for section"

  @eyes
  Scenario: Teacher can view more tiles when clicking on view more button
    When I open my eyes to test "teacher dashboard"
    Given I am a teacher and go home

    # Add new courses so new tiles are visible on the teacher dashboard
    And I create a new "Hour of Code" student section named "Section 1" assigned to "AI for Oceans"
    And I press keys ":escape"
    And I create a new "High School" student section named "Section 2" assigned to "Computer Science Principles" version "'17-'18"
    And I create a new "Hour of Code" student section named "Section 3" assigned to "Artist"
    And I create a new "Hour of Code" student section named "Section 4" assigned to "Classic Maze"
    And I create a new "Hour of Code" student section named "Section 5" assigned to "Flappy Code"
    And element ".ui-test-view-more-courses" is not visible
    And I see no difference for "5 course tiles"

    # Add one additional course so the View More button is visible
    And I create a new "Hour of Code" student section named "Section 6" assigned to "Disney Infinity Play Lab"
    And I see no difference for "view more button visible"

    And I click selector "button:contains(View more)"
    And I see no difference for "all tiles visible"
    And I close my eyes
    