Feature: Dance Party

  Scenario: Dance AI Modal
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/3"
    And I wait for the page to fully load
    And I select age 10 in the age dialog
    And I drag block "dance_ai" to block "setup"
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"

    # First time choosing emojis.
    And I wait for 0.5 seconds
    And I press "[aria-label=🎉]" using jQuery
    And I press "[aria-label=🤖]" using jQuery
    And I press "[aria-label=🪩]" using jQuery
    And I press "#generate-button" using jQuery

    # Wait until results show.
    And I wait until element "#use-button" is visible

    # Toggle to code and back.
    And I press "toggle-code-button" using jQuery
    And I press "toggle-effect-button" using jQuery

    # Go to explanation and back.
    And I press "#explanation-button" using jQuery
    And element "#explanation-area" is visible
    And I press "#leave-explanation-button" using jQuery
    And element "#explanation-area" is not visible

    # Regenerate.
    And I press "#regenerate-button" using jQuery

    # Wait until results show.
    And I wait until element "#use-button" is visible

    # Start over.
    And I press "#start-over-button" using jQuery

    # Second time choosing emojis.
    And I wait for 0.5 seconds
    And I press "[aria-label=💎]" using jQuery
    And I press "[aria-label=🌊]" using jQuery
    And I press "[aria-label=🪩]" using jQuery
    And I press "#generate-button" using jQuery

    # Wait until results show.
    And I wait until element "#use-button" is visible

    # Use effects.
    And I press "#use-button" using jQuery
    And element "#ai-modal-header-area" is not visible

    # Run once.
    And I press "runButton"
    And I press "resetButton"
