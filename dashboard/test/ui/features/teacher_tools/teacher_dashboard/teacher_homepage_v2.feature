@no_mobile
Feature: Using the teacher homepage

  Scenario: Teacher can access section pages from section options dropdown
    Given I create a teacher named "Teacher Hank"
    And I sign in as "Teacher Hank" and go home
    And I get levelbuilder access

    # Create a section with a course
    And I create a new student section assigned to course "interactive-games-animations-2024" unit 1 and save the section

    # Create a student to join the second section
    And I create a student named "Bobby"
    And I sign in as "Bobby"
    And I join the section

    # Navigate to the new teacher homepage
    And I sign out and sign in as "Teacher Hank"
    And I am on "http://studio.code.org/teacher_dashboard/home"

    # Visit the section settings page from the section options dropdown
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-Section-settings" once it exists
    Then I wait until element "#sections-set-up-container" is visible

    # Visit the roster page from the section options dropdown
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-Roster" once it exists
    Then I wait until element "#uitest-manage-students-table" is visible

    # Visit the login info page from the section options dropdown
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-Login-cards" once it exists
    Then I wait until element "#ui-test-section-login-info" is visible

    # Open the print certificates page from the section options dropdown
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-print-certificates" once it exists to load a new page
    Then I wait until element "#certificate-batch" is visible

  Scenario: Teacher can archive and restore sections from the section options dropdown
    Given I am a teacher
    And I create a new student section
    And I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-archive-section" once it exists
    And I click "#ui-test-archived"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-archive-section" once it exists
    And I click "#ui-test-teaching"
    Then I wait until element "#section-options-dropdown-dropdown-button" is visible

Scenario: Teacher can delete a section from the section options dropdown
    Given I am a teacher
    And I create a new student section
    And I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#section-options-dropdown-dropdown-button" once it exists
    And I click "#ui-test-delete-section" once it exists
    And I click "#ui-test-delete-section-confirm" once it exists
    Then I wait until element "#section-options-dropdown-dropdown-button" is gone

  Scenario: Teacher can assign a course from the "Assign a course" button and access lessons from the "Jump to" dropdown
    Given I am a teacher
    And I create a new student section
    And I am on "http://studio.code.org/teacher_dashboard/home"
    And I click "#ui-test-empty-state-button-Assign-a-course" once it exists to load a new page
    Then I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And element "span:contains(Untitled Section)" is visible
    And I click the "Untitled Section" checkbox in the dialog
    And I click selector "button:contains(Confirm section assignments)"
    And I wait until element "p:contains(You have successfully assigned)" is visible
    Given I am on "http://studio.code.org/teacher_dashboard/home"
    And I wait until element "#course-content-dropdown-Untitled-Section" is visible
    And element "#course-content-dropdown-Untitled-Section" has text "Course: AI for Oceans"
    Then I click "#go-to-lesson-dropdown-button" once it exists
    And I click "#ui-test-lesson-AI-for-Oceans" once it exists
    Then I wait until element "a:contains(AI for Oceans)" is visible

  Scenario: Teacher can access section roster from the "Add students" button on the section card
    Given I am a teacher
    And I create a new student section
    And I am on "http://studio.code.org/teacher_dashboard/home"
    Then I click "#ui-test-empty-state-button-Add-students" once it exists
    Then I wait until element "#uitest-manage-students-table" is visible

  Scenario: Teacher can view student progress from the "View progress" button on the section card
    Given I create a teacher named "Teacher Hank"
    And I sign in as "Teacher Hank" and go home
    And I get levelbuilder access
    And I create a new student section assigned to course "interactive-games-animations-2024" unit 1 and save the section
    Then I create a student named "Bobby"
    And I sign in as "Bobby"
    And I join the section
    Then I sign out and sign in as "Teacher Hank"
    And I am on "http://studio.code.org/teacher_dashboard/home"
    Then I click "#task-button-View-progress-New-Section" once it exists
    Then I wait until element "h1:contains(Progress)" is visible

  Scenario: Teacher can view lesson materials from the "View lesson materials" button on the section card
    Given I am a teacher
    And I create a new student section assigned to course "interactive-games-animations-2024" unit 1
    And I am on "http://studio.code.org/teacher_dashboard/home"
    Then I click "#task-button-View-lesson-materials-New-Section" once it exists
    Then I wait until element "h1:contains(Lesson Materials)" is visible

  @eyes
  Scenario: Teacher can view sections on new teacher homepage
    When I open my eyes to test "teacher homepage"
    Given I create a teacher named "Teacher Hank"
    And I sign in as "Teacher Hank" and go home
    And I get levelbuilder access

    # Create an empty section
    And I create a new student section

    # Create a section with a course
    And I create a new student section assigned to course "interactive-games-animations-2024" unit 1 and save the section

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
