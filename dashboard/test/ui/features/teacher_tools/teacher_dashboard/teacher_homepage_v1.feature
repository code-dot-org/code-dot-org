@no_mobile
Feature: Using the teacher dashboard homepage (v1)

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

  Scenario: Decline invitation to new progress view
    Given I am on "http://studio.code.org"
    When I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" unit 1
    And I complete the level on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    Then I click selector "#ui-test-toggle-progress-view"
    And I reload the page
    Then I click selector "#ui-close-dialog"
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"

  Scenario: Accept invitation to new progress view and see new view immediately.
    Given I am on "http://studio.code.org"
    When I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" unit 1
    And I complete the level on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    Then I click selector "#ui-test-toggle-progress-view"
    And I reload the page
    Then I click selector "#accept-invitation"
    And I wait until element "h6:contains(Icon Key)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible

  Scenario: Delay responding to invitation to new progress view and see old view immediately.
    Given I am on "http://studio.code.org"
    When I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" unit 1
    And I complete the level on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    Then I click selector "#ui-test-toggle-progress-view"
    And I wait until element "#uitest-course-dropdown" is visible
    And I reload the page
    Then I click selector "#remind-me-later-option"
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"

  @eyes
  Scenario: Teacher can view more tiles when clicking on view more button
    When I open my eyes to test "teacher dashboard"
    Given I am a teacher and go home

    # Add new courses so new tiles are visible on the teacher dashboard
    And I create a new "Hour of Code" student section named "Section 1" assigned to "AI for Oceans"
    And I press keys ":escape"
    And I create a new "High School" student section named "Section 2" assigned to "Computer Science Principles" version "'25-'26"
    And I create a new "Hour of Code" student section named "Section 3" assigned to "Artist"
    And I create a new "Hour of Code" student section named "Section 4" assigned to "Classic Maze"
    And element ".ui-test-view-more-courses" is not visible
    And I see no difference for "5 course tiles"

    # Add one additional course so the View More button is visible
    And I create a new "Hour of Code" student section named "Section 5" assigned to "Disney Infinity Play Lab"
    And I see no difference for "view more button visible"

    And I click selector "button:contains(View more)"
    And I see no difference for "all tiles visible"
    And I close my eyes
