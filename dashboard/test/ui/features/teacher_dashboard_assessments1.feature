@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the assessments tab in the teacher dashboard

  Scenario: Assessments tab initialization
    Given I create an authorized teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I sign out

    # Assign a script with a survey but no assessment
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home"
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I wait until element "#uitest-assignment-family" is visible
    And I select the "Computer Science Principles" option in dropdown "uitest-assignment-family"
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('17-'18)" once I see it
    And I select the "CSP Student Post-Course Survey ('17-'18)" option in dropdown "uitest-secondary-assignment"
    And I press the first ".uitest-saveButton" element
    And I wait until element ".modal-backdrop" is gone

    # Progress tab
    When I click selector "a:contains('Untitled Section')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible

    # Assessments tab
    When I click selector "#learn-tabs a:contains('Assessments/Surveys')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "h3:contains(this survey is anonymous)" is visible
