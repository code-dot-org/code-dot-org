@dashboard_db_access
@pegasus_db_access
@as_teacher
Feature: Using the teacher homepage sections feature

  Scenario: Loading the teacher homepage with new sections
    Given I am on "http://studio.code.org/home?enableExperiments=section-flow-2017"

    When I see the section set up box
    And I press the new section button
    Then I should see the new section dialog

    When I select picture login
    And I press the save button to create a new section
    And I wait for the dialog to close
    Then I should see the section table

    And I am on "http://studio.code.org/home?disableExperiments=section-flow-2017"
