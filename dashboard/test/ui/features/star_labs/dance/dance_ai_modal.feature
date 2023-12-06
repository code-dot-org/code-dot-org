Feature: Dance Party

  Scenario: Dance AI Modal
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/3"
    And I wait for the page to fully load
    And I select age 10 in the age dialog
    And I drag block "dance_ai" to block "setup"
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"

    # First time choosing emojis
    And I wait for 0.5 seconds
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(3)" using jQuery
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(15)" using jQuery
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(19)" using jQuery
    And I press "#generate-button" using jQuery

    # Wait until results show
    And I wait until element "#use-button" is visible

    # Go to explanation and back
    And I press "#explanation-button" using jQuery
    And I press "#leave-explanation-button" using jQuery

    # Regenerate
    And I press "#regenerate-button" using jQuery

    # Wait until results show
    And I wait until element "#use-button" is visible

    # Start over
    And I press "#start-over-button" using jQuery

    # Second time choosing emojis
    And I wait for 0.5 seconds
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(4)" using jQuery
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(16)" using jQuery
    And I press ".src-dance-ai-dance-ai-modal-module__emojiIcon:nth-of-type(20)" using jQuery
    And I press "#generate-button" using jQuery

    # Wait until results show
    And I wait until element "#use-button" is visible

    # Use effects
    And I press "#use-button" using jQuery

    # Run once
    And I press "runButton"
    And I press "resetButton"
