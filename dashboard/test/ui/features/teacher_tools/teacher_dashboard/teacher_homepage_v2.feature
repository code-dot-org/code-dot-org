@no_mobile
Feature: Using the teacher homepage
  @eyes
  Scenario: Teacher can view sections on new teacher homepage
    When I open my eyes to test "teacher homepage"
    Given I create a teacher named "Teacher Hank"

    # This line can be removed when the new teacher homepage is the default
    Then I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I sign in as "Teacher Hank" and go home
    And I get levelbuilder access

    # Create an empty section
    And I create a new student section

    # Create a section with a course
    And I create a new student section assigned to "interactive-games-animations-2024" and save the section

    # Create a student to join the second section
    Given I create a student named "Bobby"
    Then I sign in as "Bobby"
    And I join the section

    # Navigate to the new teacher homepage
    Then I sign out and sign in as "Teacher Hank"
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I wait to see "#ui-test-section-list"
    And I see no difference for "teacher homepage"
    And I close my eyes
