@no_mobile
Feature: Assigning Modular Courses
  Scenario: Assign unit in modular course from unit overview page
    Given I am a teacher with student sections named Section 1 and Section 2
    And I am on "http://studio.code.org/courses/ui-test-course-2019/units/3"
    And I wait until element "#uitest-multi-assign-button" is visible
    And I press the first "#uitest-multi-assign-button" element
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
    And I see that "Section 1" is assigned to "UI Test Shared Unit" in the section table
    And I see that "Section 2" is not assigned to "ui-test-course-2019" in the section table
    And I see that "Section 2" is not assigned to "UI Test Shared Unit" in the section table

  Scenario: Assign unit in modular course from course overview page
    Given I am a teacher with student sections named Section 1 and Section 2
    And I am on "http://studio.code.org/courses/ui-test-course-2019"
    And I click selector ".uitest-CourseScript #uitest-multi-assign-button:eq(2)" once I see it
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
    And I see that "Section 1" is assigned to "UI Test Shared Unit" in the section table
    And I see that "Section 2" is not assigned to "ui-test-course-2019" in the section table
