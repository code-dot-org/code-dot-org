@no_mobile
Feature: AI Tutor smoke tests on legacy labs and Lab2 resource panels

  Background:
    Given I create a teacher named "Simone"
    And I give user "Simone" authorized teacher permission

  Scenario: Chat works in the legacy labs AI Tutor
    Given I am on "http://studio.code.org/projects/applab/new?hideProductTours=true"
    And I wait for the lab page to fully load
    And I wait until element "[aria-label='Open AI tutor']" is visible

    When I click selector "[aria-label='Open AI tutor']"
    And I wait until element "#uitest-chat-textarea" is visible
    And I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"

    Then element "[aria-label='User chat message']" has text "Hello"
    And I wait until element "[aria-label='AI bot chat message']" is visible
    And element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(255, 240, 247)"

  Scenario: Chat works in the resource panel AI Tutor tab in Python Lab
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/50/levels/1?hideProductTours=true"
    And I wait until element "#resource-panel-tab-button-aiTutor" is visible

    When I click selector "#resource-panel-tab-button-aiTutor"
    And I wait until element "#uitest-chat-textarea" is visible
    And I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"

    Then element "[aria-label='User chat message']" has text "Hello"
    And I wait until element "[aria-label='AI bot chat message']" is visible
    And element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(110, 21, 67)"

  Scenario: Chat works in the resource panel AI Tutor tab in Weblab2
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/51/levels/11?hideProductTours=true"
    And I wait until element "#instructions-drawer" is visible
    And I wait until element "#resource-panel-tab-button-aiTutor" is visible

    When I click selector "#resource-panel-tab-button-aiTutor"
    And I wait until element "#uitest-chat-textarea" is visible
    And I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"

    Then element "[aria-label='User chat message']" has text "Hello"
    And I wait until element "[aria-label='AI bot chat message']" is visible
    And element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(110, 21, 67)"
