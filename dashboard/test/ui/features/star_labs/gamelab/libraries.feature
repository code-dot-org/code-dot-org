# Maddie (6/12/2020) disabled in IE because "And I press keys" step does not work in IE.
# https://github.com/code-dot-org/code-dot-org/pull/24646
@no_ie
@no_mobile
Feature: Libraries

  @as_student
  Scenario: Publishing and unpublishing a library
    Given I publish a basic library in Game Lab
    Then I save the URL

    # Check for library on /projects/libraries
    Then I am on "http://studio.code.org/projects/libraries"
    And I wait until element ".ui-test-library-table" is visible
    And element ".ui-test-library-table td:contains('UntitledProject')" is visible

    # Unpublish library
    Then I navigate to the saved URL
    And I wait for the page to fully load
    Then I open the library publish dialog
    And I click selector "#ui-test-unpublish-library" once I see it
    And I wait until element "b:contains('Successfully unpublished your library')" is visible

  Scenario: Adding and removing a library from a project
    # Student1 publishes a library
    Given I create a student named "Student1"
    Given I publish a basic library in Game Lab
    Then I save the channel id

    # Student2 imports Student1's library
    Given I create a student named "Student2"
    And I start a new Game Lab project
    And I wait for the page to fully load
    Then I open the Manage Libraries dialog
    And I wait until element "h1:contains('Import library from ID')" is visible
    And I type the saved channel id into element "#ui-test-import-library > input"
    And I click selector "#ui-test-import-library > button" to load a new page

    # Confirm Student1's library is in Student2's project
    And I wait for the page to fully load
    Then I open the Manage Libraries dialog
    And I wait until element "a:contains('UntitledProject')" is visible

    # Remove Student1's library from Student2's project
    And I click selector ".ui-test-remove-library:eq(0)" to load a new page
    And I wait for the page to fully load
    Then I open the Manage Libraries dialog
    And I wait until element "div:contains('You have no libraries in your project')" is visible

  Scenario: Assigning a library to a section as a teacher
    Given I create a teacher named "Library_Teacher"
    And I create a new section
    Given I publish a basic library in Game Lab
    When I close the dialog

    # Teacher assigns library to a section
    Then I open the library publish dialog
    And I click selector "#ui-test-manage-libraries" once I see it
    And I wait until element ".ui-test-sortable-table-select" is visible
    When I select the "Untitled Project" option in dropdown named "selectOption"
    And I click selector ".ui-test-sortable-table-select table input:eq(0)"
    And I click selector ".modal div:contains('Assign library'):last"
    And I wait until element "p:contains('This library is assigned to the following sections:')" is visible
    Then I sign out

    # Student in teacher's section should see teacher's library
    Given I create a student named "Library_Student"
    And I join the section
    And I start a new Game Lab project
    And I wait for the page to fully load
    Then I open the Manage Libraries dialog
    And I wait until element "a:contains('UntitledProject')" is visible
    And I wait until element "span:contains('Library_Teacher')" is visible
