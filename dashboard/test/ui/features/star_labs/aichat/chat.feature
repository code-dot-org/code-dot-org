@no_mobile
Feature: AI Chat

  "AI Chat" is our lab that introduces students to generative AI
  by allowing them to customize, then interact with large language models.

  Background:
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/47/levels/2"
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible
    And I dismiss the teacher panel

  # As of 9/4/24, cannot access SageMaker in Drone.
  # More discussion in this Slack thread: https://codedotorg.slack.com/archives/C03CK49G9/p1725475362107969
  @no_circle
  Scenario: Making chat request gets response
    When I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    And I wait until element "[aria-label='AI bot']" is visible
    Then element "[aria-label='AI bot']" has css property "background-color" equal to "rgb(224, 248, 249)"

  Scenario: Editing system prompt produces success notification and saves
    When I press keys "You are a silly chatbot" for element "#system-prompt"
    And I wait until element "#uitest-update-customizations" is enabled
    And I click selector "#uitest-update-customizations"
    Then I wait until element ".uitest-aichat-chat-alert" contains text "System prompt has been updated"

    Given I reload the page
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible
    And I dismiss the teacher panel
    Then element "#system-prompt" has text "You are a silly chatbot"

  Scenario: Publishing model enables published view and saves
    When I click selector "#modelCustomizationTabs-tab-modelCardInfo"
    And I wait until element "#uitest-publish-notes-tab-content" is visible
    And I press keys "Jeeves" for element "#botName"
    And I press keys "A description" for element "#description"
    And I press keys "An intended use" for element "#intendedUse"
    And I press keys "Some limitations and warnings" for element "#limitationsAndWarnings"
    And I press keys "Some testing and evaluation that was done" for element "#testingAndEvaluation"
    And I press keys "An example prompt or topic" for element "#exampleTopics"
    And I wait until element "#uitest-add-example-topic" is enabled
    And I click selector "#uitest-add-example-topic"
    And I wait until element "#uitest-publish-notes-save" is enabled
    And I click selector "#uitest-publish-notes-save"
    Then I wait until element ".uitest-aichat-chat-alert" contains text "Model card information has been updated"
    And I wait for 3 seconds

    Given element "#uitest-view-mode-toggle-container" is not visible
    And element "#uitest-presentation-view-container" is not visible
    When I click selector "#uitest-publish-notes-publish"
    Then I wait until element "#uitest-view-mode-toggle-container" is visible
    And I wait until element "#uitest-presentation-view-container" is visible
    And I wait until element "#uitest-presentation-view-header" contains text "Jeeves"

    Given I reload the page
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible
    And I dismiss the teacher panel
    When I click selector "#uitest-user-view-button" once I see it
    Then I wait until element "#uitest-presentation-view-header" contains text "Jeeves"
