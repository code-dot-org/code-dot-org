@no_mobile
@single_session
Feature: Personal Project Gallery

Background:
  Given I create a student named "Project_Creator"

Scenario: Can Toggle to the Public Project Gallery
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#uitest-personal-projects" is visible
  And element "#uitest-public-projects" is not visible
  Then I navigate to the public gallery via the gallery switcher

Scenario: Can Publish and Unpublish a Project (Button Version)
  Given I make a "playlab" project named "Publishable Project"
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#uitest-personal-projects" is visible
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "Publishable Project"
  Then I publish the project from the personal projects table publish button
  Then I click selector ".ui-personal-projects-unpublish-button"
  And I wait until element ".ui-personal-projects-publish-button" is visible

@no_ie
# Disabling IE due to bug where key changes are not registered,
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
  And I wait until element ".ui-project-rename-input" is visible
  And I press keys "New Name" for element ".ui-project-rename-input"
  Then I click selector ".ui-projects-rename-save"
  And I wait until element ".ui-projects-rename-save" is not visible
  And the first project in the table is named "New Name"

Scenario: Can Remix a Project
  Given I make a "playlab" project named "Remix Template"
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#uitest-personal-projects" is visible
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "Remix Template"
  Then I scroll the ".ui-projects-table-dropdown" element into view
  Then I click selector ".ui-projects-table-dropdown"
  And I press the child number 1 of class ".pop-up-menu-item"
  And I wait until current URL contains "/edit"

Scenario: Can Delete a Project
  Given I make a "playlab" project named "To Be Deleted"
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#uitest-personal-projects" is visible
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "To Be Deleted"
  Then I scroll the ".ui-projects-table-dropdown" element into view
  Then I click selector ".ui-projects-table-dropdown"
  And I press the child number 2 of class ".pop-up-menu-item"
  And I wait until element ".ui-confirm-project-delete-button" is visible
  Then I click selector ".ui-confirm-project-delete-button"
  And I wait until element ".ui-confirm-project-delete-button" is not visible
  And the project table contains 0 rows
