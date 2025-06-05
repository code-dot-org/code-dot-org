@as_student
Feature: App Lab Scenarios

  Background:
    Given I start a new Applab project
    And I wait for the lab page to fully load

  Scenario:
    # Project Template Workspace Icon should not appear since this is not a project template backed level.
    Then element ".projectTemplateWorkspaceIcon" is not visible
