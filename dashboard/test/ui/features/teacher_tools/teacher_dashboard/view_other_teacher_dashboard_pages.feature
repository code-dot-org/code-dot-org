@no_mobile
Feature: Views the pages on the teacher dashboard that are untested elsewhere
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"
    Given I use a cookie to mock the DCDO key "ai-tutor-teacher-nav-v2" as "false"

  @properties_encryption_key
  Scenario: Viewing teacher dashboard pages
    Given I am on "http://studio.code.org"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" unit 1
    And I complete the level on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/1"
    And I complete the free response on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/27/levels/1"
    And I submit the assessment on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/33/levels/1"

    # Progress tab
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "h6:contains(Icon Key)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible
    Then I click selector "#ui-test-toggle-progress-view"
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"

    # Stats tab
    Given I click selector "#ui-test-teacher-sidebar a:contains('Stats')" once I see it
    And I wait until element "#uitest-stats-table" is visible
    And element "#uitest-stats-table tr:eq(1)" contains text "Sally"

    # Manage students tab
    Given I click selector "#ui-test-teacher-sidebar a:contains('Roster')" once I see it
    And I wait until element "#uitest-manage-students-table" is visible
    And element "#uitest-manage-students-table tr:eq(1)" contains text "Sally"
    And I wait until element "#uitest-privacy-text" is visible
    And element "#uitest-privacy-text" contains text "We encourage you to share this letter"
    And I wait until element "#uitest-privacy-link" is visible
    And element "#uitest-privacy-link" contains text "Just looking for a letter"

    # Text responses tab
    Given I click selector "#ui-test-teacher-sidebar a:contains('Text Responses')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I wait until element "#text-responses-table" is visible
    And element "#text-responses-table tr:contains(Sally)" contains text "hello world"

    # Assessments/Surveys tab: anonymous survey
    Given I click selector "#ui-test-teacher-sidebar a:contains('Assessments')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I wait until element "div:contains(no submissions for this assessment)" is visible
    And I wait until element "div:contains(this survey is anonymous)" is not visible
    And I select the "Lesson 30: Anonymous student survey" option in dropdown "assessment-selector"
    And I wait until element "div:contains(this survey is anonymous)" is visible
    And I wait until element "div:contains(no submissions for this assessment)" is not visible

    # Assessments/Surveys tab: assessment
    And I select the "Lesson 33: Single page assessment" option in dropdown "assessment-selector"
    And I wait until element "#uitest-submission-status-table" is visible
    And element "#uitest-submission-status-table tr:eq(1)" contains text "Sally"
