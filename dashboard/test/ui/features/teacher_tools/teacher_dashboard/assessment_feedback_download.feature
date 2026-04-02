@no_mobile
Feature: Using the assessments tab in the teacher dashboard to get feedback for script

  Background:
    Given I create an authorized teacher-associated student named "Sally"

  Scenario: Assessments tab has feedback download
    # Assign a unit with a survey but no assessment
    When I sign in as "Teacher_Sally"
    Then I am on "http://studio.code.org/teacher_dashboard/home"
    And I assign my section in row 1 to course "csp-2025" unit 3
    And I reload the page
    And I click selector "a:contains(View progress)" once I see it

    # Progress tab
    And I wait until element "#unit-selector-v2" is visible

    # Assessments tab
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    And I wait until element "#unit-selector-v2" is visible
    Then I wait until element "#assessment-selector" is visible
    And I select the "All teacher feedback in this unit" option in dropdown "assessment-selector"
    Then I wait until element "div:contains(Download CSV of Feedback)" is visible

  Scenario: Assessments tab does not have feedback download
   # Assign a unit without feedback
    When I sign in as "Teacher_Sally" and go home
    Then I click selector "#section-options-dropdown-dropdown-button" once I see it
    And I click selector "#ui-test-Section-settings" once I see it
    Then I wait until element "#uitest-section-name-setup" is visible
    And I press keys "testingSection" for element "#uitest-section-name-setup"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(Hour of Code)" is visible
    And I click selector "button:contains(Hour of Code)"
    And I press the first "input[name='UI Test Artist']" element
    And I press the first "#uitest-save-section-changes" element
    And I wait until element "h1:contains(Progress)" is visible

    # Assessments tab
    And I wait until element "#ui-test-teacher-sidebar a:contains(Assessments)" is visible
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    Then I wait until element "div:contains(It looks like there are no multi-question assessments or surveys in this course)" is visible

