@no_firefox
@dashboard_db_access
@as_student
Feature: App Lab Embed

  Background:
    Given I start a new Applab project
    And I wait for the page to fully load

  Scenario: App Lab Embed
    Given I ensure droplet is in text mode
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
    Then I wait until element "a:contains('How it Works (View Code)')" is visible within element "iframe"
    And I make all links in "iframe" open in the current tab
    And I click selector "a:contains('How it Works (View Code)')" within element "iframe"

    And I wait to see Applab code mode

  Scenario: App Lab Embed without Source
    Given I ensure droplet is in text mode
    And I append text to droplet "button('hello', 'world');"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    And element "#divApplab > .screen > button#hello" contains text "world"
    And I press "resetButton"

    Then I navigate to the embedded version of my project with source hidden
    And I wait until element ".fa-play" is visible within element "iframe"
    And I click selector ".fa-play" within element "iframe"
    And I wait until element "#divApplab > .screen > button#hello" is visible within element "iframe"
    Then I wait until element "a.more-link" is visible within element "iframe"
    And I click selector "a.more-link" within element "iframe"
