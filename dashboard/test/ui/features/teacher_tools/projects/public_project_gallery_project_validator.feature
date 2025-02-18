@dashboard_db_access
@no_mobile
# only run in one browser, because multiple simultaneously-running instances of
# this feature can interfere with each other.
@only_one_browser
@single_session
Feature: Public Project Gallery - Project Validator

Background:
  Given I create a teacher named "Project_Czar"
  And I give user "Project_Czar" project validator permission
  And I remove featured projects from the gallery

Scenario: Can Toggle to the Personal Project Gallery
  Given I am on "http://studio.code.org/projects/public"
  And I wait until element "#projects-page" is visible
  And I wait until element "#uitest-public-projects" is visible
  And element "#uitest-personal-projects" is not visible
  And I navigate to the personal gallery via the gallery switcher

Scenario: Can See Special Topics and View More with Experiment enabled
  Given I am on "http://studio.code.org/projects/public/?enableExperiments=special-topic"
  And I wait until element "#projects-page" is visible
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 2 project types
  And element ".ui-special_topic" contains text "View more Featured Topics projects"
