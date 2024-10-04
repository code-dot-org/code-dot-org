@no_mobile
Feature: Using the manage students tab of the teacher dashboard
  Scenario: Teacher bulk updates US state for all section students
    Given I create a teacher-associated under-13 student in Colorado named "Student" after CAP start
    And I sign in as "Teacher_Student" and go home
    And I save the section id from row 0 of the section table
    And I navigate to manage students for the section I saved

    # Enable the US state column
    When I use a cookie to mock the DCDO key "section_us_state_column_enabled_for" as "["all"]"
    And I reload the page
    Then I wait until element "#uitest-manage-students-table th:contains(State)" is visible

    # Test the US state Bulk Set modal
    When I click selector "#uitest-manage-students-table th:contains(State) i"
    And I click selector ".pop-up-menu-item:contains(Set state for all students)"
    Then I wait until element "#us-state-column-bulk-set-modal" is visible
    And element "#us-state-column-bulk-set-modal h4" contains text "Set state for all students"
    And element "#us-state-column-bulk-set-modal label[for='us-state']" contains text "State"
    And element "#us-state-column-bulk-set-modal select#us-state option:checked" contains text "Choose a state"
    And element "#us-state-column-bulk-set-modal" contains text "Please be sure to choose the correct state. For certain states, we may be required to obtain parental consent for student accounts."
    And the href of selector "#us-state-column-bulk-set-modal a:contains(Learn more about parental consent)" contains "https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts"

    When I select the "AL" option in dropdown "us-state"
    And I click selector "#us-state-column-bulk-set-modal button:contains(Add)"
    Then I wait until element "#us-state-column-bulk-set-modal" is not visible
    And element "#uitest-manage-students-table tbody tr:nth-child(1) select[name='usState'] option[value='AL']" is checked

    When I click selector "#uitest-manage-students-table tbody tr:nth-child(1) span:contains(Save)"
    # Wait until the name input fields are changed to plain text, indicating that the student has been saved
    And I wait until element "#uitest-manage-students-table tbody tr:nth-child(1) select[name='usState']" is not visible
    # Check usState cells after reloading the page to ensure they has been saved in the database
    Then I reload the page
    And I wait until element "#uitest-manage-students-table tr:nth-child(1):contains(Student) td:contains(AL)" is visible
