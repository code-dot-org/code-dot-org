Feature: Dance Party

  Scenario: Dance AI Modal
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/3"
    And I wait for the lab page to fully load
    And I select age 10 in the age dialog
    And I drag block "dance_ai" to block "setup"
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"

    # First time choosing emojis.
    And I wait for 0.5 seconds
    And I press "[aria-label=🎉]" using jQuery
    And I press "[aria-label=🤖]" using jQuery
    And I press "[aria-label=🪩]" using jQuery
    And I press "generate-button"

    # Wait until results show.
    And I wait until element "#use-button" is visible

    # Toggle to code and back.
    And I press "toggle-code-button"
    And I press "toggle-effect-button"

    # Go to explanation and back.
    And I press "explanation-button"
    And element "#explanation-area" is visible
    And I press "leave-explanation-button"
    And element "#explanation-area" is not visible

    # Regenerate.
    And I press "regenerate-button"

    # Wait until results show.
    And I wait until element "#use-button" is visible

    # Start over.
    And I press "start-over-button"

    # Second time choosing emojis.
    And I wait for 0.5 seconds
    And I press "[aria-label=💎]" using jQuery
    And I press "[aria-label=🌊]" using jQuery
    And I press "[aria-label=🚀]" using jQuery
    And I press "generate-button"

    # Wait until results show.
    And I wait until element "#use-button" is visible

    # Use effects.
    And I press "use-button"
    And element "#ai-modal-header-area" is not visible

    # Run.
    And I press "runButton"
    And I press "resetButton"

    # Reopen modal.
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"

    # Toggle to code and use it.
    And I press "toggle-code-button"
    And I press "convert-button"
    And element "#ai-modal-header-area" is not visible

    # Setup now has two blocks.
    And element "[data-id='setup'] > g > g > .blocklyPath" is visible

    # Run.
    And I press "runButton"
    And I press "resetButton"
