@no_mobile
Feature: Using the manage students tab of the teacher dashboard

  Scenario: Viewing the manage students tab in normal and edit mode
    # Navigate to Manage Students tab as Teacher
    When I sign in as "Teacher_Sally" and go home
    And I create a new word student section
    Then I navigate to manage students for the section I saved
    And I wait until element "#uitest-manage-students-table" is visible

    And I wait until element ".uitest-display-name" is visible
