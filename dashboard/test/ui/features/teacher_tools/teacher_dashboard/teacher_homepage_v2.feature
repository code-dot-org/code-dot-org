@no_mobile
Feature: Using the teacher homepage
  Scenario: Teacher can access section pages from section options dropdown
    Given I create a teacher named "Teacher Hank"

    # This line can be removed when the new teacher homepage is the default
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I sign in as "Teacher Hank" and go home
    And I get levelbuilder access

    # Create a section with a course
    And I create a new student section assigned to "interactive-games-animations-2024" and save the section

    # Create a student to join the second section
    And I create a student named "Bobby"
    And I sign in as "Bobby"
    And I join the section

    # Navigate to the new teacher homepage
    And I sign out and sign in as "Teacher Hank"
    And I am on "http://studio.code.org/teacher_dashboard/home"

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

  Scenario: Teacher can archive and restore sections from the section options dropdown
    Given I am a teacher
    And I create a new student section
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-archive-section" once it exists
    And I click "#ui-test-archived"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-archive-section" once it exists
    And I click "#ui-test-teaching"
    Then I wait to see "#section-options-dropdown-dropdown-button"

Scenario: Teacher can delete a section from the section options dropdown
    Given I am a teacher
    And I create a new student section
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-delete-section" once it exists
    And I click "#ui-test-delete-section-confirm" once it exists
    Then I wait until element "#section-options-dropdown-dropdown-button" is gone
  
  Scenario: Teacher can assign a course from the "Assign a course" button and access lessons from the "Jump to" dropdown
    Given I am a teacher
    And I create a new student section
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#ui-test-empty-state-button-Assign-a-course" once it exists
    Then I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And element "span:contains(Untitled Section)" is visible
    And I click the "Untitled Section" checkbox in the dialog
    And I click selector "button:contains(Confirm section assignments)"
    And I wait until element "p:contains(You have successfully assigned)" is visible
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I wait to see "#course-content-dropdown-Untitled-Section"
    And element "#course-content-dropdown-Untitled-Section" has text "Course: AI for Oceans"
    Then I click "#go-to-lesson-dropdown-dropdown-button" once it exists
    And I click "#ui-test-Lesson-1-AI-for-Oceans" once it exists
    Then I wait to see "a:contains(AI for Oceans)"

  Scenario: Teacher can access section roster from the "Add students" button on the section card
    Given I am a teacher
    And I create a new student section
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I am on "http://studio.code.org/teacher_dashboard/home"
    Then I click "#ui-test-empty-state-button-Add-students" once i exists
    Then I wait to see "#uitest-manage-students-table"

  Scenario: Teacher can view student progress from the "View progress" button on the section card
    Given I am a teacher
    And I create a new student section
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I am on "http://studio.code.org/teacher_dashboard/home"
    Then I click "#task-button-View-progress" once it exists
    Then I wait to see "h1:contains(Progress)"

  Scenario: Teacher can view lesson materials from the "View lesson materials" button on the section card
    Given I am a teacher
    And I create a new student section assigned to "interactive-games-animations-2024"
    And I use a cookie to mock the DCDO key "teacher-homepage-v2" as "true"
    And I am on "http://studio.code.org/teacher_dashboard/home"
    Then I click "#task-button-View-lesson-materials" once it exists
    Then I wait to see "h1:contains(Lesson Materials)"

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
