@no_mobile
Feature: Creating and Editing Modular Courses

  Scenario: Assign a course to a shared unit
    Given I create a levelbuilder named "Levi"
    And I create a temp course
    And I create a temp migrated unit with lessons

    When I view the temp course edit page
    And I add the temp unit to the course
    And I add the unit "ui-test-shared-unit" to the course
    And I click "button[type='submit']" to load a new page

    Then I wait for the temp course overview page to load
    And element ".uitest-CourseScript" contains text "ui-test-shared-unit"

    # Make sure 'ui-test-shared-unit' is still in 'ui-test-course-2017'
    Then I am on "http://studio.code.org/courses/ui-test-course-2017"
    And element ".uitest-CourseScript" contains text "ui-test-shared-unit"

    And I delete the temp unit with lessons
    And I delete the temp course
