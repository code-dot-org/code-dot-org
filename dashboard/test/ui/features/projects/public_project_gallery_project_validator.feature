@dashboard_db_access
@no_mobile
# only run in one browser, because multiple simultaneously-running instances of
# this feature can interfere with each other.
@only_one_browser
Feature: Public Project Gallery - Project Validator

Background:
  Given I create a teacher named "Project_Czar"
  And I give user "Project_Czar" project validator permission
  And I remove featured projects from the gallery

Scenario: Published Projects Show In Recency Order
  Then I make a playlab project named "Older Published"
  Then I publish the project
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  And element ".ui-project-name:eq(0)" contains text "Older Published"
  Then I make a playlab project named "Newer Published"
  Then I publish the project
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I debug element ".ui-project-name:eq(0)" text content
  Then I debug element ".ui-project-name:eq(1)" text content
  Then I debug element ".ui-project-name:eq(2)" text content
  Then I debug element ".ui-project-name:eq(3)" text content
  Then element ".ui-project-name:eq(0)" contains text "Newer Published"

Scenario: Featured Projects Show Before Published Projects
  Then I make a playlab project named "First Featured"
  Then I publish the project
  Then I press "#feature_project" using jQuery
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I wait until element ".ui-project-name" is in the DOM
  Then element ".ui-project-name:eq(0)" contains text "First Featured"
  Then I make a playlab project named "Published, NOT Featured"
  Then I publish the project
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I debug element ".ui-project-name:eq(0)" text content
  Then I debug element ".ui-project-name:eq(1)" text content
  Then I debug element ".ui-project-name:eq(2)" text content
  Then I debug element ".ui-project-name:eq(3)" text content
  And element ".ui-project-name:eq(0)" contains text "First Featured"

Scenario: UnPublished, Featured Projects Do Not Show
  Then I make a playlab project named "Published, Featured"
  Then I publish the project
  Then I press "#feature_project" using jQuery
  Then I make a playlab project named "Unpublished, Featured"
  Then I press "#feature_project" using jQuery
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I debug element ".ui-project-name:eq(0)" text content
  Then I debug element ".ui-project-name:eq(1)" text content
  Then I debug element ".ui-project-name:eq(2)" text content
  Then I debug element ".ui-project-name:eq(3)" text content
  And element ".ui-project-name:eq(0)" contains text "Published, Featured"

Scenario: Can Toggle to the Personal Project Gallery
  Given I am on "http://studio.code.org/projects/public"
  And I wait until element "#public-gallery" is visible
  And element "#react-personal-projects" is not visible
  Then I click selector "#uitest-gallery-switcher div:contains(My Projects)"
  Then check that I am on "http://studio.code.org/projects"
  And I wait until element "#react-personal-projects" is visible
  And element "#public-gallery" is not visible

Scenario: Can See App Lab/Game Lab View More Links
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element "#public-gallery" is visible
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 7 project types
  And element ".ui-project-app-type-area:eq(4)" contains text "View more App Lab projects"
  And element ".ui-project-app-type-area:eq(5)" contains text "View more Game Lab projects"
