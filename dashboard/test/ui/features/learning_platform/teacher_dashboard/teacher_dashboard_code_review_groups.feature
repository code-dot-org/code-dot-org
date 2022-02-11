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

  Scenario: Create a code review group
    Given I create a new code review group for the section I saved
    And I add the first student to the first code review group
    Then element ".uitest-code-review-group:first-of-type" has text "Hermione"
    And I click selector ".uitest-base-dialog-confirm"
    Then element ".uitest-base-dialog-footer" eventually contains text "Changes have been saved"
    And I click selector "#uitest-code-review-groups-toggle"
    # need to fix this -- this selects toggle, which doesnt actually contain text
    Then element ".fa.fa-toggle-on:first-of-type" eventually contains text "Code review will be automatically disabled"
#  Scenario: Move students into code review group
#  Scenario: Save updates to groups
#
#  Scenario: Unassign all students from code review group
#  Scenario: Enable code review for section