# Skip on IE due to blocked pop-ups and possible "new document" issues
@no_ie
@as_student
@no_mobile
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
    And I switch to the first iframe
    And I wait until element ".fa-play" is visible
    And I click selector ".fa-play"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    Then I wait until element "button.more-link" is visible
    And I click selector "button.more-link"
    Then I wait until element "a:contains('How it Works (View Code)')" is visible
    And I click selector "a:contains('How it Works (View Code)')" to load a new tab

    And I wait for the page to fully load
    And I wait to see Applab code mode

  Scenario: App Lab Embed without Source
    Given I ensure droplet is in text mode
    And I append text to droplet "button('hello', 'world');"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    And element "#divApplab > .screen > button#hello" contains text "world"
    And I press "resetButton"

    Then I navigate to the embedded version of my project with source hidden
    And I switch to the first iframe
    And I wait until element ".fa-play" is visible
    And I click selector ".fa-play"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    Then I wait until element "button.more-link" is visible
    And I click selector "button.more-link"
