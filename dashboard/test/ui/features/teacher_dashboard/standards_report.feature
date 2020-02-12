@skip #Dani looking into as part of standards work
@no_mobile
Feature: Viewing and Printing Standards Progress

  Scenario: Viewing standards progress in Progress Tab of Teacher Dashboard
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to script "coursea-2019"
    Given I am assigned to script "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I get hidden script access
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved with experiment "standardsReport"
    And I wait until element "#uitest-teacher-dashboard-nav" is visible
    And check that the URL contains "/teacher_dashboard/sections/"
    And I wait until element "#uitest-course-dropdown" contains text "All the Things! *"

    # Check that you can't switch to standards when not on CSF course
    And I wait until element "#uitest-standards-toggle" is not visible

    # Switch to a CSF course
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "Course A (2019)" option in dropdown "uitest-course-dropdown"

    # Switch to Standards Part of Progress Tab
    And I press the first "#uitest-standards-toggle" element
    And I wait until element ".uitest-standards-intro-button" is visible
    And I press the first ".uitest-standards-intro-button" element
    And I wait until element ".uitest-standards-generate-report" is visible
    And I press the first ".uitest-standards-generate-report" element

    # Generate PDF
    Then I wait until element ".modal" contains text "Create a CSTA Standards report"
    Then I wait until element ".modal" contains text "Step 1: Tell us which unplugged lessons* your class has completed"
    And I wait until element ".uitest-standards-generate-report-next" is visible
    And I press the first ".uitest-standards-generate-report-next" element
    Then I wait until element ".modal" contains text "Step 2: Add a personalized note to your report"
    And I wait until element ".uitest-standards-generate-report-finish" is visible
    And I press the first ".uitest-standards-generate-report-finish" element


