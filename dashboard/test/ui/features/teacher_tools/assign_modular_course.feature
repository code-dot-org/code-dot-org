@no_mobile
Feature: Assigning Modular Courses
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"

  Scenario: Assign unit in modular course from unit overview page
    Given I am a teacher with student sections named Section 1 and Section 2
    And I am on "http://studio.code.org/courses/ui-test-course-2019/units/3"
    And I wait until element ".uitest-assign-button" is visible
    And I press the first ".uitest-assign-button" element
    And I wait until element "button:contains(Confirm section assignments)" is visible
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected

    When I click the "Section 1" checkbox in the dialog
    And the "Section 1" checkbox is selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"
    And I wait until element "span:contains(Success! Assignment updated!)" is visible
    And I am on "http://studio.code.org/home"

    Then I see that "Section 1" is assigned to "ui-test-course-2019" in the section table
    And I see that "Section 1" is assigned to "ui-test-shared-unit" in the section table
    And I see that "Section 2" is not assigned to "ui-test-course-2019" in the section table
    And I see that "Section 2" is not assigned to "ui-test-shared-unit" in the section table
