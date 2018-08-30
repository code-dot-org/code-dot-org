@dashboard_db_access
@no_mobile

Feature: Personal Project Gallery

Background:
  Given I create a student named "Project_Creator"

Scenario: Can Toggle to the Public Project Gallery
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#react-personal-projects" is visible
  And element "#public-gallery" is not visible
  Then I navigate to the public gallery via the gallery switcher

Scenario: Can Publish and Unpublish a Project (Button Version)
  Given I make a playlab project named "Publishable Project"
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#react-personal-projects" is visible
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "Publishable Project"
  Then I publish the project from the personal projects table publish button
  Then I click selector ".ui-personal-projects-unpublish-button"
  And I wait until element ".ui-personal-projects-publish-button" is visible
