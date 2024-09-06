@no_mobile
@eyes
Feature: Using the manage students tab of the teacher dashboard

  @skip
  Scenario: Viewing the manage students tab in normal and edit mode
    When I open my eyes to test "manage students tab"
    Given I create an authorized teacher-associated student named "SallyHasAVeryVeryLongFirstName"

    # Navigate to Manage Students tab as Teacher
    When I sign in as "Teacher_SallyHasAVeryVeryLongFirstName" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to manage students for the section I saved
    And I wait until element "#uitest-manage-students-table" is visible

    # Add a family name for Sally
    And I click selector ".ui-test-section-dropdown" once I see it
    And I press the child number 0 of class ".pop-up-menu-item"
    And I wait until element with css selector "input[name='uitest-family-name']" is enabled
    And I press keys "SallyAlsoHasAVeryVeryLongLastName" for element "input[name='uitest-family-name']"
    And I click selector "button:contains(Save)"
    And I see no difference for "manage students tab"

    And I close my eyes

  Scenario: Teacher bulk updates US state for all section students
    Given I create a teacher named "Teacher"
    And I create a new student section and go home
    And I save the section id from row 0 of the section table
    And I create a teacher-associated under-13 student in Colorado named "Student 1" for teacher "Teacher" after CAP start
    And I create a teacher-associated student named "Student 2" for teacher "Teacher"
    And I sign in as "Teacher"
    And I navigate to manage students for the section I saved

    # Test the US state Bulk Set modal
    When I click selector "#uitest-manage-students-table th:contains(State) i"
    And I click selector ".pop-up-menu-item:contains(Add state for all students)"
    Then I wait until element "#us-state-column-bulk-set-modal" is visible
    And element "#us-state-column-bulk-set-modal h4" contains text "Add state for all students"
    And element "#us-state-column-bulk-set-modal label[for='us-state']" contains text "State"
    And element "#us-state-column-bulk-set-modal select#us-state" contains text "Choose a state"
    And element "#us-state-column-bulk-set-modal" contains text "Please be sure to choose the correct state. For certain states, we may be required to obtain parental consent for student accounts."
    And the href of selector "#us-state-column-bulk-set-modal a:contains(Learn more about parental consent)" contains "https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts"

    When element "#us-state-column-bulk-set-modal" is visible
    Then I open my eyes to test "manage students tab us state bulk set modal"
    And I see no difference for "manage students tab us state bulk set modal"
    And I close my eyes

    When I select the "AL" option in dropdown "us-state"
    And I click selector "#us-state-column-bulk-set-modal button:contains(Add)"
    Then I wait until element "#us-state-column-bulk-set-modal" is not visible
    And element "#uitest-manage-students-table tr:has(input[value='Student 1']) td:has(select[name='usState'] option[value='AL']:selected)" is visible
    And element "#uitest-manage-students-table tr:has(input[value='Student 2']) td:has(select[name='usState'] option[value='AL']:selected)" is visible

    When I click selector "#uitest-manage-students-table span:contains(Save all)"
    # Wait until the name input fields are changed to plain text, indicating that the student has been saved
    And I wait until element "#uitest-manage-students-table tr:contains(Student 1)" is visible
    And I wait until element "#uitest-manage-students-table tr:contains(Student 2)" is visible
    # Check usState cells after reloading the page to ensure they has been saved in the database
    Then I reload the page
    And element "#uitest-manage-students-table tr:contains(Student 1) td:contains(AL)" is visible
    And element "#uitest-manage-students-table tr:contains(Student 2) td:contains(AL)" is visible
