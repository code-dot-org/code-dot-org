@no_mobile
Feature: Managing code review groups in the "Manage Students" tab of the teacher dashboard

Background:
  Given I create a levelbuilder named "Dumbledore"
  And I create a new student section assigned to "ui-test-csa-family-script"
  And I sign in as "Dumbledore" and go home
  And I save the student section url
  And I save the section id from row 0 of the section table
  Given I create a student named "Hermione"
  And I join the section
  # Observed flakiness trying to navigate to teacher dashboard while still signed in as Hermione.
  # Explicitly wait for sign out to occur to avoid this.
  And I wait to see ".alert-success"
  And I sign out using jquery
  Given I sign in as "Dumbledore" and go home

  Scenario: Create a code review group, add a student to it, save it, and unassign all from group
    Given I create a new code review group for the section I saved
    When I add the first student to the first code review group
    Then element ".uitest-code-review-group:first-of-type" has text "Hermione"
    When I click selector ".uitest-base-dialog-confirm"
    Then element ".uitest-base-dialog-footer" eventually contains text "Changes have been saved"
    And element ".uitest-base-dialog-confirm" is disabled
    When I click selector "#uitest-unassign-all-button"
    Then element "#uitest-code-review-group-unassigned" has text "Hermione"
    And element ".uitest-base-dialog-confirm" is enabled

  Scenario: Enable code review for a section
    Given I open the code review groups management dialog
    When I click selector "#uitest-code-review-groups-toggle"
    # We display a message with the number of days until code review groups expire when code review is enabled
    Then element "#uitest-code-review-groups-status-message" eventually contains text "Code review will be automatically disabled"
