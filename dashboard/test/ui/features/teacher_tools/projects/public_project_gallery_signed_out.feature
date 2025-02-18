Feature: Public Project Gallery - Signed Out

Background:
  Given I am on "http://studio.code.org/projects/public"

Scenario: Public Gallery Shows Expected Elements
  Then I wait until element "h1" contains text "Projects"
  Then I wait until element "#uitest-public-projects" is visible

Scenario: Public Gallery Shows Expected Project Types
  Then I wait until element "#uitest-public-projects" is visible
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 1 project types
  And element ".ui-featured" contains text "Featured Projects"
