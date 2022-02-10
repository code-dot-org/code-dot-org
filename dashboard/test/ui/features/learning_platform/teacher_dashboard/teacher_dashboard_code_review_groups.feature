@no_mobile
Feature: Managing code review groups in the "Manage Students" tab of the teacher dashboard

Background:
  Given I create a levelbuilder named "Dumbledore"
  And I sign in as "Dumbledore" and go home
  And I create a new section named "CSA Section" assigned to "CSA Pilot"
  And I save the section url
  And I save the section id from row 0 of the section table
  Given I create a student named "Hermione"
  And I join the section
  Given I sign in as "Dumbledore" and go home
  And I open the code review groups management dialog

  Scenario: Create a code review group
  Given I create a new code review group for the section I saved
    And I add the first student to the first code review group
    Then element
    And I click selector ".uitest-base-dialog-confirm"
    And I click selector "#uitest-code-review-groups-toggle"
  Scenario: Move students into code review group
  Scenario: Save updates to groups

  Scenario: Unassign all students from code review group
  Scenario: Enable code review for section

  SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
  FROM
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE
  REFERENCED_TABLE_SCHEMA = 'dashboard_test'
  AND REFERENCED_TABLE_NAME = 'schools';