@no_mobile
@eyes
Feature: Using the progress tab of the teacher dashboard

  Scenario: Toggling between views in progress tab
    When I open my eyes to test "progress tab views"
    Given I create an authorized teacher-associated student named "Sally"

   # Make sure Course A is in the drop down so we can use it for standards tab
    Given I am assigned to script "coursea-2019"
    Given I am assigned to script "allthethings"

    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/lessons/33/levels/1"

    # Navigate to Progress tab As Teacher
    When I sign in as "Teacher_Sally" and go home
    And I get hidden script access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-course-dropdown" contains text "All the Things! *"

    # Summary View
    And I wait until element ".uitest-summary-cell" is visible
    And I see no difference for "summary view"
    And I wait until element "#uitest-toggle-detail-view" is visible
    And I press the first "#uitest-toggle-detail-view" element

    # Detail View
    And I wait until element ".uitest-detail-cell" is visible
    And I see no difference for "detail view"

    # Standards View - Need to be in a course that has standards
    And I select the "Course A (2019)" option in dropdown "uitest-course-dropdown"
    And I wait until element "#uitest-course-dropdown" contains text "Course A (2019)"

    And I wait until element "#uitest-standards-toggle" is visible
    And I press the first "#uitest-standards-toggle" element

    # Clear the intro dialog
    And I wait until element ".uitest-standards-intro-button" is visible
    And I see no difference for "standards intro"
    And I press the first ".uitest-standards-intro-button" element

    And I wait until element ".uitest-standards-intro-button" is not visible
    And I wait until element "#uitest-progress-standards-table" is visible
    And I see no difference for "standards view"
    And I close my eyes
