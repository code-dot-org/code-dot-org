@no_mobile

Feature: Viewing and Printing Standards Progress

  Background:
    Given I create a teacher named "Standards Importer"
    Then I sign in as "Standards Importer"
    Then I am on "http://studio.code.org/admin/standards"
    And I wait until element "#import-standards" is visible
    And I press "#import-standards" using jQuery
    And I wait until element "#alert-details" is visible
    And element "#alert-details" contains text "Hooray!"

  Scenario: Viewing standards progress in Progress Tab of Teacher Dashboard
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to script "coursea-2019"
    Given I am assigned to script "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I get hidden script access
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-teacher-dashboard-nav" is visible
    And check that the URL contains "/teacher_dashboard/sections/"
    And I wait until element "#uitest-course-dropdown" contains text "All the Things! *"

    # Check that you can't switch to standards when not on CSF course
    And I wait until element "#uitest-toggle-detail-view" is visible
    And I wait until element "#uitest-standards-toggle" is not visible

    # Switch to a CSF course
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "Course A (2019)" option in dropdown "uitest-course-dropdown"

    # Switch to Standards Part of Progress Tab
    And I click selector "#uitest-standards-toggle" once I see it

    # Clear the intro dialog
    And I wait until element ".uitest-standards-intro-button" is visible
    And I press the first ".uitest-standards-intro-button" element

    # Check the Standards View
    And I wait until element "#teacher-dashboard" contains text "CSTA Standards in"
    And I wait until element "#uitest-standards-view" is visible
    And I wait until element "#uitest-progress-standards-table" is visible
    And element "#uitest-progress-standards-table" contains text "1A-AP-08"
    And element "#uitest-progress-standards-table" contains text "Model daily processes by creating and following algorithms (sets of step-by-step instructions) to complete tasks."
    And element "#uitest-progress-standards-table" contains text "Available in 1 Lesson:"
    And element "#test-how-to-standards" contains text "How to use this information"

    # Generate PDF
    And I wait until element ".uitest-standards-generate-report" is visible
    And I press the first ".uitest-standards-generate-report" element
    Then I wait until element ".modal" contains text "Generate a PDF copy of this report"
    Then I wait until element ".modal" contains text "Step 1: Tell us which unplugged lessons* your class has completed"
    And I wait until element ".uitest-standards-generate-report-next" is visible
    And I press the first ".uitest-standards-generate-report-next" element
    Then I wait until element ".modal" contains text "Step 2: Add a personalized note to your report"
    And I wait until element ".uitest-standards-generate-report-finish" is visible
    And I press the first ".uitest-standards-generate-report-finish" element

    When I switch tabs
    Then I wait until element "#uitest-standards-print-button" is visible
    And I wait until element "#uitest-progress-standards-table" is visible
    And I wait until element "#uitest-progress-standards-table" contains text "Model daily processes by creating and following algorithms (sets of step-by-step instructions) to complete tasks."
    And I wait until element "#uitest-progress-standards-table" contains text "Available in 1 Lesson:"
    And I press the first "#uitest-standards-print-button" element
