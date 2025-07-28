@no_mobile
Feature: Using the assessments tab in the teacher dashboard to get feedback for script

  Background:
    Given I create an authorized teacher-associated student named "Sally"

  Scenario: Assessments tab has feedback download
    # Assign a unit with a survey but no assessment
    When I sign in as "Teacher_Sally"
    Then I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/18/levels/15"
    And I wait for the lab page to fully load
    Then I am on "http://studio.code.org/home"
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(High School)" is visible
    And I click selector "button:contains(High School)"
    And I press the first "input[name='Computer Science Principles']" element
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('25-'26)" once I see it
    And I wait until element "#uitest-secondary-assignment" is visible
    And I select the "Intro to App Design" option in dropdown "uitest-secondary-assignment"
    And I press the first "#uitest-save-section-changes" element to load a new page

    # Progress tab
    And I wait until element "#uitest-course-dropdown" is visible

    # Assessments tab
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "#assessment-selector" is visible
    And I select the "All teacher feedback in this unit" option in dropdown "assessment-selector"
    Then I wait until element "div:contains(Download CSV of Feedback)" is visible

  Scenario: Assessments tab does not have feedback download
   # Assign a unit without feedback
    When I sign in as "Teacher_Sally" and go home
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link" to load a new page
    Then I wait until element "#uitest-section-name-setup" is visible
    And I press keys "testingSection" for element "#uitest-section-name-setup"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(Hour of Code)" is visible
    And I click selector "button:contains(Hour of Code)"
    And I press the first "input[name='Artist']" element
    And I press the first "#uitest-save-section-changes" element
    And I wait until element "h1:contains(Progress)" is visible

    # Assessments tab
    And I wait until element "#ui-test-teacher-sidebar a:contains(Assessments)" is visible
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    Then I wait until element "div:contains(It looks like there are no multi-question assessments or surveys in this course)" is visible

