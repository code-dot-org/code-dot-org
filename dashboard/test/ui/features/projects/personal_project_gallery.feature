@dashboard_db_access
@no_mobile

Feature: Personal Project Gallery

Background:
  Given I create a student named "Project_Creator"

Scenario: Can Toggle to the Public Project Gallery
  Given I am on "http://studio.code.org/projects"
  And I wait until element "#react-personal-projects" is visible
  And element "#public-gallery" is not visible
  Then I click selector "#uitest-gallery-switcher div:contains(Public Projects)"
  Then check that I am on "http://studio.code.org/projects/public"
  And I wait until element "#public-gallery" is visible
  And element "#react-personal-projects" is not visible
