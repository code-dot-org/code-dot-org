@no_ie
@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the teacher dashboard

  Scenario: Loading the teacher dashboard
    Given I am on "http://code.org/"
    And I am a teacher
    And I am on "http://code.org/teacher-dashboard?no_home_redirect=1"
    Then I wait to see ".outerblock"
    Then I click selector "div.title:contains('Student Accounts and Progress')"
    Then I wait until I am on "http://studio.code.org/home"

  Scenario: Loading student progress
    Given I create a teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/stage/27/puzzle/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/stage/33/puzzle/1"
    And I sign out

    # Progress tab
    When I sign in as "Teacher_Sally"
    And I am on "http://code.org/teacher-dashboard?no_home_redirect=1"
    And I click selector "div.title:contains('Student Accounts and Progress')" once I see it
    And I click selector "a:contains('New Section')" once I see it
    And I wait until element "#uitest-course-dropdown" contains text "All the Things! *"
    And I wait until element "#uitest-summary-view" is visible
    And I click selector "#uitest-toggle-detail-view" once I see it
    And I wait until element "#uitest-detail-view" is visible
    And I wait until element "a[href*='/s/allthethings/stage/2/puzzle/1']" is in the DOM
    # Completed bubble is green
    Then element "a[href*='/s/allthethings/stage/2/puzzle/1'] .uitest-bubble" has css property "background-color" equal to "rgb(14, 190, 14)"
    # Not started bubble is gray
    Then element "a[href*='/s/allthethings/stage/2/puzzle/2'] .uitest-bubble" has css property "background-color" equal to "rgb(254, 254, 254)"

    # Stats tab
    And I click selector "#learn-tabs a:contains('Stats')" once I see it
    And I wait until element "#uitest-stats-table" is visible

    # Manage students tab
    When I click selector "#learn-tabs a:contains('Manage Students')" once I see it
    And I wait until element "#uitest-manage-tab" is visible
    And I wait until element "#uitest-privacy-link" is visible
    And element "#uitest-privacy-link" contains text "privacy document"

    # Text responses tab
    When I click selector "#learn-tabs a:contains('Text Responses')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible

    # Assessments and surveys tab
    When I click selector "#learn-tabs a:contains('Assessments/Surveys')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible

  
