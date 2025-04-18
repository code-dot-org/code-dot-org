@no_mobile
Feature: Using the teacher homepage
  @eyes
  Scenario: Teacher can view sections on new teacher homepage
    When I open my eyes to test "teacher homepage"
    Given I am a teacher
    When I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I create a new student section and go home
    And I see no difference for "teacher homepage"
