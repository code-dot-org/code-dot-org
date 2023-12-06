Feature: Dance Party

  @no_mobile
  Scenario: Dance AI Modal
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/3"
    And I wait for the page to fully load
    And I select age 10 in the age dialog
    And I drag block "dance_ai" to block "setup"
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"

    And I wait for 2 seconds
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(3)" using jQuery
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(15)" using jQuery
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(19)" using jQuery

    And I press "#generate-button" using jQuery

    And I wait until element "#use-button" is visible
    And I press "#use-button" using jQuery

    And I press "runButton"
    And I press "resetButton"
