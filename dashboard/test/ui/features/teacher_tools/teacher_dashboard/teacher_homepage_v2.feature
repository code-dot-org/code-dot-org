@no_mobile
Feature: Using the teacher homepage
  @eyes
  Scenario: Teacher can view sections on new teacher homepage
    When I open my eyes to test "teacher homepage"
    Given I am a teacher
    Then I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I create a new student section and go home
    And I wait to see "#ui-test-teacher-homepage"
    And I see no difference for "section with no students or assignments"

    Then I create a new student section assigned to "ui-test-csa-family-script"
    And I see no difference for "section with assigned course"
    And I close my eyes
