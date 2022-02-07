@no_mobile
Feature: Code Review Groups

  # to do
  # (x) make levelbuilder teacher so csa shows up in course list
  # (x) create a csa section
  # (x) create multiple students
  # (x) navigate to teacher dashboard, manage students
  # (x) create a code review group
  # (x) put a student in one of the groups
  # ...

  Scenario: Setting up groups
    Given I create a levelbuilder named "Dumbledore"
    When I sign in as "Dumbledore" and go home
    And I create a new section named "CSA Section" assigned to "CSA Pilot"
    And I save the section url
    And I save the section id from row 0 of the section table
    Given I create a student named "Hermione"
    And I join the section
    Given I create a student named "Harry"
    And I join the section
    When I sign in as "Dumbledore" and go home
    Then I navigate to teacher dashboard for the section I saved
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Manage Students)" once I see it
    And I click selector "#uitest-code-review-groups-button" once I see it
    # Sometimes this click isn't happening, waiting seems to make it more consistent
    And I wait for 2 seconds
    # Create group
    And I click selector "#uitest-create-code-review-group" once I see it
    # Put students in group
    And I focus selector "#uitest-unassign-all-button"
    And I press keys ":tab"
    And I press keys ":space"
    And I press keys ":arrow_right"
    And I press keys ":space"
    And I focus selector "#uitest-unassign-all-button"
    And I press keys ":tab"
    And I press keys ":space"
    And I press keys ":arrow_right"
    And I press keys ":space"
    # Save groups
    And I click selector ".uitest-base-dialog-confirm"
    # Enable code review
    And I click selector "#uitest-code-review-groups-toggle"
    And I wait for 5 seconds
    # Unassign all
    And I click selector "#uitest-unassign-all-button"
    # Unassign all
    # Groups save?
    # Enable/disable code review