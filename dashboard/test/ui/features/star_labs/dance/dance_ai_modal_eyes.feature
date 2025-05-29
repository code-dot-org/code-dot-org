@no_mobile
@eyes
Feature: Dance Party AI Modal Eyes

  Scenario: Dance AI Modal
    # In LTR language
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/4"
    And I wait for the lab page to fully load
    And I select age 10 in the age dialog
    # Toggle to code
    When I open my eyes to test "open Dance AI modal"
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"
    And I wait until element "#use-button" is visible    
    And I press "toggle-code-button"
    And I wait for 1 second
    And I see no difference for "toggle to code"
    And I press "toggle-effect-button"
    # Starting over in AI modal
    And I press "start-over-button"
    And I wait for 0.5 seconds
    # Selecting new emojis
    And I press "[aria-label=💎]" using jQuery
    And I press "[aria-label=🌊]" using jQuery
    And I press "[aria-label=🚀]" using jQuery
    And I wait for 1 second
    And I see no difference for "selecting new emojis"

    # In RTL language
    Then I am on "http://studio.code.org/s/allthethings/lessons/37/levels/4/lang/ar-sa"
    And I wait for the lab page to fully load
    # Toggle to code in RTL
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"
    And I wait until element "#use-button" is visible    
    And I press "toggle-code-button"
    And I wait for 1 second
    And I see no difference for "toggle to code in RTL"
    And I press "toggle-effect-button"
    # Starting over in AI modal in RTL
    And I press "start-over-button"
    And I wait for 1 second
    And I see no difference for "starting over in Dance AI modal in RTL"
    # Selecting new emojis in RTL
    And I press "[aria-label=💎]" using jQuery
    And I press "[aria-label=🌊]" using jQuery
    And I press "[aria-label=🚀]" using jQuery
    And I wait for 1 second
    And I see no difference for "selecting new emojis in RTL"
    And I close my eyes