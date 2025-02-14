Feature: Teacher viewing student chat history in AI Chat lab

Scenario: Teacher views student chat history
  # Create teacher, student, and section
  Given I create a teacher named "Simone"
  And I give user "Simone" authorized teacher permission
  And I create a new student section assigned to "customizing-llms-2024" and save the section
  Given I create a student named "Hermione"
  And I join the section

  # Have student interact with model
  And I am on "http://studio.code.org/s/customizing-llms-2024/lessons/2/levels/9"
  And I click selector "#ui-close-dialog" once I see it
  And I wait until element "#ui-close-dialog" is not visible
  When I press keys "Hello" for element "#uitest-chat-textarea"
  And I wait until element "#uitest-chat-submit" is enabled
  And I click selector "#uitest-chat-submit"
  And I wait until element "[aria-label='AI bot chat message']" is visible
  Then element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(224, 248, 249)"
  When I press keys "Damn" for element "#uitest-chat-textarea"
  And I wait until element "#uitest-chat-submit" is enabled
  And I click selector "#uitest-chat-submit"
  And I wait until element ".uitest-chat-message" contains text "This message has been flagged by our content moderation policy."
  And I click selector "[aria-label='Decrease']"
  And I wait until element "#uitest-update-customizations" is enabled
  And I click selector "#uitest-update-customizations"
  Then I wait until element ".uitest-aichat-chat-alert" contains text "Temperature has been updated to 0.7"

  # Have teacher view chat history
  When I sign in as "Simone"
  And I am on "http://studio.code.org/s/customizing-llms-2024/lessons/2/levels/9"
  And I click selector "#ui-close-dialog" once I see it
  And I wait until element "#ui-close-dialog" is not visible
#  And I load student number 1's project from the blue teacher panel
  And I wait to see ".show-handle"
  And I click selector ".show-handle .fa-chevron-left"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:eq(1)"
  And I dismiss the teacher panel
  And I wait until element ".uitest-chat-message" contains text "This message has been flagged by our content moderation policy."
  And I click selector "[aria-label='show message']"
  And I wait until element ".uitest-profane-feedback-footer" contains text "Was this content flagged correctly?"
  And I click selector "[aria-label='thumbs up']"
  And I wait until element ".uitest-profane-feedback-footer" contains text "This content was flagged correctly."
  And I click selector ".uitest-clean-feedback-footer button[aria-label='flag']"
  And I wait until element ".uitest-clean-feedback-footer button[aria-label='unflag']" is visible
  # Interact with student model
  # Confirm value is 0.7
  And I wait until element ".uitest-temperature-container" contains text "0.7"
  And I press the last button with text "Test student model"
  When I press keys "Hello" for element "#uitest-chat-textarea"
  And I wait until element "#uitest-chat-submit" is enabled
  And I click selector "#uitest-chat-submit"
  And I wait until element "[aria-label='AI bot chat message']" is visible
  Then element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(224, 248, 249)"
