@no_mobile
Feature: Aichat Chat

  Scenario: Makes chat request and gets response
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/47/levels/2"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible
    And I dismiss the teacher panel

    And I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    And I wait until element "[aria-label='AI bot']" is visible
    And element "[aria-label='AI bot']" has css property "background-color" equal to "rgb(224, 248, 249)"

  Scenario: Edits system prompt and sees save success notification
    Given I am on "http://studio.code.org/s/allthethings/lessons/47/levels/2"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible

    And I press keys "You are a silly chatbot" for element "#system-prompt"
    And I wait until element "#uitest-update-customizations" is enabled
    And I click selector "#uitest-update-customizations"
    And I wait until element ".uitest-aichat-chat-alert" contains text "System prompt has been updated"

