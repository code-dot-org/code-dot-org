@no_mobile
Feature: Using the teacher homepage
  Scenario: Teacher can access section pages and actions from section options dropdown
    Given I create a teacher named "Teacher Hank"

    # This line can be removed when the new teacher homepage is the default
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I sign in as "Teacher Hank" and go home
    And I get levelbuilder access

    # Create a section with a course
    And I create a new student section assigned to "interactive-games-animations-2024" and save the section

    # Create a student to join the second section
    Given I create a student named "Bobby"
    Then I sign in as "Bobby"
    And I join the section

    # Navigate to the new teacher homepage
    Then I sign out and sign in as "Teacher Hank"
    Given I am on "http://studio.code.org/teacher_dashboard/home"

    # Visit the section settings page from the section options dropdown
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-settings" once it exists
    Then I wait to see "#sections-set-up-container"

    # Visit the roster page from the section options dropdown
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-roster" once it exists
    Then I wait to see "#uitest-manage-students-table"

    # Visit the login info page from the section options dropdown
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-login_info" once it exists
    Then I wait to see "#ui-test-section-login-info"

    # Open the print certificates page from the section options dropdown
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-print-certificates" once it exists
    Then I wait to see "#certificate-batch"

    # Archive/restore a section from the section options dropdown 
    # and toggle between archived and teaching views
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-archive-section" once it exists
    Then I click "#ui-test-archived"
    And I wait to see "#section-options-dropdown-dropdown-button"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-archive-section" once it exists
    Then I click "#ui-test-teaching"
    And I wait to see "#section-options-dropdown-dropdown-button"

    # Delete a section from the section options dropdown
    Then I create a new student section
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I wait until I see 2 of element "#section-options-dropdown-dropdown-button"
    And I press element 1 with selector "#section-options-dropdown-dropdown-button"
    And I do not see "ui-test-delete-section"
    And I press element 2 with selector "#section-options-dropdown-dropdown-button"
    And I click "#ui-test-delete-section" once it exists
    And I click "#ui-test-delete-section-confirm" once it exists
    And I wait until I see 2 of element "#section-options-dropdown-dropdown-button"

  @eyes
  Scenario: Teacher can view sections on new teacher homepage
    When I open my eyes to test "teacher homepage"
    Given I create a teacher named "Teacher Hank"

    # This line can be removed when the new teacher homepage is the default
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
