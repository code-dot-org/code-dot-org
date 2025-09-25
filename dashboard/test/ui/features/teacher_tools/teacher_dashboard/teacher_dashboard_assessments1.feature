@no_mobile
Feature: Using the assessments tab in the teacher dashboard

  Scenario: Assessments tab initialization
    Given I create an authorized teacher-associated student named "Sally"

    # Assign a unit with a survey but no assessment
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I click selector "#section-options-dropdown-dropdown-button" once I see it
    And I click selector "#ui-test-Section-settings"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(High School)" is visible
    And I click selector "button:contains(High School)"
    And I press the first "input[name='Computer Science Principles']" element
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('24-'25)" once I see it
    And I wait until element "#uitest-secondary-assignment" is visible
    And I select the "CS Principles Post-Course Survey" option in dropdown "uitest-secondary-assignment"
    And I press the first "#uitest-save-section-changes" element to load a new page

    # Progress tab
    And I wait until element "#uitest-course-dropdown" is visible

    # Assessments tab
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "div:contains(this survey is anonymous)" is visible
