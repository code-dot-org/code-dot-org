@dashboard_db_access
@as_student
Feature: App Lab Embed

  Background:
    Given I start a new Applab project

  Scenario: App Lab Embed
    Given I switch to text mode
    And I append text to droplet "button('hello', 'world');"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    And element "#divApplab > .screen > button#hello" contains text "world"
    And I press "resetButton"

    Then I navigate to the embedded version of my project
    And I wait until element ".fa-play" is visible within element "iframe"
    And I click selector ".fa-play" within element "iframe"
    And I wait until element "#divApplab > .screen > button#hello" is visible within element "iframe"
    Then I wait until element "a.more-link" is visible within element "iframe"
    And I click selector "a.more-link" within element "iframe"
    Then I wait until element "a:contains('How It Works')" is visible within element "iframe"
    And I click selector "a:contains('How It Works')" within element "iframe"

    Then I go to the newly opened tab
    And I wait to see Applab code mode
