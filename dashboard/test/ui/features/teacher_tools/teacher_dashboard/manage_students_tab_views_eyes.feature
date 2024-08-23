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
    And I press keys "SallyAlsoHasAVeryVeryLongLastName" for element "input[name='uitest-family-name']"
    And I click selector "button:contains(Save)"
    And I see no difference for "manage students tab"

    And I close my eyes
