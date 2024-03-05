@no_mobile
@single_session
Feature: Personal Project Gallery

Background:
  Given I create a teacher-associated student named "Project_Creator"

Scenario: Can Rename a Project
  Given I make a "playlab" project named "Old Name"
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#uitest-personal-projects" is visible
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "Old Name"
  Then I scroll the ".ui-projects-table-dropdown" element into view
  Then I click selector ".ui-projects-table-dropdown"
  And I press the child number 0 of class ".pop-up-menu-item"
  And I wait for 3 seconds
  And I clear the text from element "#ui-project-rename-input"
  And I press keys "New Name" for element "#ui-project-rename-input"
  Then I click selector ".ui-projects-rename-save"
  And I wait until element ".ui-projects-rename-save" is not visible
  And the first project in the table is named "New Name"

