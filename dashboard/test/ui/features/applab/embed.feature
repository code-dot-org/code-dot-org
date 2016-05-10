@dashboard_db_access
@as_student
Feature: App Lab Embed

  Background:
    Given I start a new Applab project
    And I append "?enableExperiments=applab-embed" to the URL

  Scenario: App Lab Embed
    Given I switch to text mode
    And I append text to droplet "button('hello', 'world');"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    And element "#divApplab > .screen > button#hello" contains text "world"
    And I press "resetButton"

    Then I navigate to the embedded version of my project
    And I wait until element "#divApplab > .screen > button#hello" is visible within element "iframe"
