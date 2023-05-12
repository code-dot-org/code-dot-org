@no_mobile
Feature: Using the teacher dashboard 2

  Scenario: Visiting student name URLs in teacher dashboard
    Given I create an authorized teacher-associated student named "Sally"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    When I click selector "a:contains(Untitled Section)" once I see it to load a new page
    And I wait until element "#uitest-teacher-dashboard-nav" is visible
    And check that the URL contains "/teacher_dashboard/sections/"
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I wait until element "a:contains(Sally)" is visible
    When I click selector "a:contains(Sally)" to load a new page
    And I wait until element "#teacher-panel-container" is visible
    And check that the URL contains "/s/allthethings"
    And check that the URL contains "viewAs=Instructor"

  Scenario: Viewing a student
    Given I create an authorized teacher-associated student named "Sally"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/lessons/33/levels/1"

    # Progress tab
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"

    # Stats tab
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Stats)" once I see it
    And I wait until element "#uitest-stats-table" is visible
    And element "#uitest-stats-table tr:eq(1)" contains text "Sally"

    # Manage students tab
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Manage Students)" once I see it
    And I wait until element "#uitest-manage-students-table" is visible
    And element "#uitest-manage-students-table tr:eq(1)" contains text "Sally"
    And I wait until element "#uitest-privacy-text" is visible
    And element "#uitest-privacy-text" contains text "We encourage you to share this letter"
    And I wait until element "#uitest-privacy-link" is visible
    And element "#uitest-privacy-link" contains text "Just looking for a letter"

    # Text responses tab
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Text Responses)" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I wait until element "#text-responses-table" is visible
    And element "#text-responses-table tr:contains(Sally)" contains text "hello world"

    # Assessments/Surveys tab: anonymous survey
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Assessments/Surveys)" once I see it
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

