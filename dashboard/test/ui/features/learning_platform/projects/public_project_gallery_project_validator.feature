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

Scenario: Published Projects Show In Recency Order
  Then I make a "playlab" project named "Older Published"
  Then I publish the project
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I scroll the Play Lab gallery section into view
  And element ".ui-project-name-playlab:contains('Published'):eq(0)" contains text "Older Published"
  Then I make a "playlab" project named "Newer Published"
  Then I publish the project
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I scroll the Play Lab gallery section into view
  Then I debug element ".ui-project-name-playlab:eq(0)" text content
  Then I debug element ".ui-project-name-playlab:eq(1)" text content
  Then I debug element ".ui-project-name-playlab:eq(2)" text content
  Then I debug element ".ui-project-name-playlab:eq(3)" text content
  Then element ".ui-project-name-playlab:contains('Published'):eq(0)" contains text "Newer Published"

Scenario: Featured Projects Show Before Published Projects
  Then I make a "playlab" project named "First Featured"
  Then I publish the project
  Then I press "#feature_project" using jQuery
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I wait until element ".ui-project-name-playlab" is in the DOM
  Then I scroll the Play Lab gallery section into view
  Then element ".ui-project-name-playlab:contains('Featured'):eq(0)" contains text "First Featured"
  Then I make a "playlab" project named "Published, NOT Featured"
  Then I publish the project
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I debug element ".ui-project-name-playlab:eq(0)" text content
  Then I debug element ".ui-project-name-playlab:eq(1)" text content
  Then I debug element ".ui-project-name-playlab:eq(2)" text content
  Then I debug element ".ui-project-name-playlab:eq(3)" text content
  And element ".ui-project-name-playlab:contains('Featured'):eq(0)" contains text "First Featured"

Scenario: UnPublished, Featured Projects Do Not Show
  Then I make a "playlab" project named "Published, Featured"
  Then I publish the project
  Then I press "#feature_project" using jQuery
  Then I make a "playlab" project named "Unpublished, Featured"
  Then I press "#feature_project" using jQuery
  Given I am on "http://studio.code.org/projects/public"
  Then I wait until element ".project_card" is in the DOM
  Then I scroll the Play Lab gallery section into view
  Then I debug element ".ui-project-name-playlab:eq(0)" text content
  Then I debug element ".ui-project-name-playlab:eq(1)" text content
  Then I debug element ".ui-project-name-playlab:eq(2)" text content
  Then I debug element ".ui-project-name-playlab:eq(3)" text content
  And element ".ui-project-name-playlab:contains('Featured'):eq(0)" contains text "Published, Featured"

Scenario: Can Toggle to the Personal Project Gallery
  Given I am on "http://studio.code.org/projects/public"
  And I wait until element "#projects-page" is visible
  And I wait until element "#uitest-public-projects" is visible
  And element "#uitest-personal-projects" is not visible
  Then I click selector "#uitest-gallery-switcher div:contains(My Projects)"
  Then check that I am on "http://studio.code.org/projects"
  And I wait until element "#uitest-personal-projects" is visible
  And element "#uitest-public-projects" is not visible

Scenario: Can See App Lab/Game Lab View More Links
  Given I am on "http://studio.code.org/projects/public"
  And I wait until element "#projects-page" is visible
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 9 project types
  And the project gallery contains 9 view more links
  And element ".ui-applab" contains text "View more App Lab projects"
  And element ".ui-gamelab" contains text "View more Game Lab projects"

Scenario: Can See Special Topics and View More with Experiment enabled
  Given I am on "http://studio.code.org/projects/public/?enableExperiments=special-topic"
  And I wait until element "#projects-page" is visible
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 10 project types
  And the project gallery contains 10 view more links
  And element ".ui-special_topic" contains text "View more Featured Topics projects"