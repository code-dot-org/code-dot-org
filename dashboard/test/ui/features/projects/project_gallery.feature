@dashboard_db_access
@no_mobile
# only run in one browser, because multiple simultaneously-running instances of
# this feature can interfere with each other.
@only_ie
Feature: Public Project Gallery

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
