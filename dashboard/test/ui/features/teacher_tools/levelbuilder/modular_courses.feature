@no_mobile
Feature: Creating and Editing Modular Courses

  Scenario: Create a new course assigned to a shared unit
    Given I create a levelbuilder named "Levi"
    And I am on "http://studio.code.org/courses/new"
    And I wait until element ".familyNameSelector" is visible
    And I create a temp migrated unit with lessons

    And I enter a temp family name
    And I select that this course will not get updated yearly
    And I wait until element "button[type='submit']" is visible
    And I click "button[type='submit']" to load a new page

    Then I wait for the temp course edit page to load
    And I add the temp unit to the course
    And I add the unit "ui-test-shared-unit" to the course
    And I click "button[type='submit']" to load a new page

    Then I wait for the temp course overview page to load
    And element ".uitest-CourseScript" contains text "UI Test Shared Unit"

    # Make sure 'ui-test-shared-unit' is still in 'ui-test-course-2017'
    Then I am on "http://studio.code.org/courses/ui-test-course-2017"
    And element ".uitest-CourseScript" contains text "UI Test Shared Unit"

    And I delete the temp unit with lessons
    And I delete the temp course
