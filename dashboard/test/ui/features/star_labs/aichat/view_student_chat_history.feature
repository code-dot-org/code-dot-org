@no_mobile
Feature: Teacher viewing student chat history in AI Chat Lab

  Teachers can view student chat history and interact with the student's customized models in AI Chat Lab.
  Teachers can provide feedback on whether messages are flagged as inappropriate by our safety tools.

Background:
  Given I create a teacher named "Simone"
  And I give user "Simone" authorized teacher permission
  And I create a new student section assigned to course "customizing-llms-2024" unit 1 and save the section

  Given I create a student named "Hermione"
  And I join the section

  # Student interacts with model to create chat history for teacher to view.
  Given I am on "http://studio.code.org/courses/customizing-llms-2024/units/1/lessons/2/levels/9"
  And I click selector "#ui-close-dialog" once I see it
  And I wait until element "#ui-close-dialog" is not visible
  When I press keys "Hello" for element "#uitest-chat-textarea"
  And I wait until element "#uitest-chat-submit" is enabled
  And I click selector "#uitest-chat-submit"
  Then I wait until element "[aria-label='AI bot chat message']" is visible
  And element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(224, 248, 249)"
  # Note that it's important that we use the word "Damn" here, as our stubbed version of our content moderation service
  # used in Drone is configured to flag this word.
  When I press keys "Damn" for element "#uitest-chat-textarea"
  And I wait until element "#uitest-chat-submit" is enabled
  And I click selector "#uitest-chat-submit"
  And I wait until element ".uitest-chat-message" contains text "This message has been flagged by our content moderation policy."
  When I click selector "[aria-label='Decrease']"
  And I wait until element "#uitest-update-customizations" is enabled
  And I click selector "#uitest-update-customizations"
  Then I wait until element ".uitest-aichat-chat-alert" contains text "Temperature has been updated to 0.7"

Scenario: Teacher views student chat history and interacts with student model
  # Teacher can view chat history and provide feedback on messages flagged as inappropriate.
  Given I sign in as "Simone"
  And I am on "http://studio.code.org/courses/customizing-llms-2024/units/1/lessons/2/levels/9"
  When I click selector "#ui-close-dialog" once I see it
  And I wait until element "#ui-close-dialog" is not visible
  And I wait to see ".show-handle"
  And I click selector ".show-handle .fa-chevron-left"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:eq(1)"
  And I dismiss the teacher panel
  And I wait to see ".uitest-is-loading-overlay"
  And I wait until element ".uitest-is-loading-overlay" is not visible
  When I click selector ".uitest-clean-feedback-footer button[aria-label='flag']" once I see it
  Then I wait until element ".uitest-clean-feedback-footer button[aria-label='unflag']" is visible
  Then element ".uitest-chat-message" contains text "This message has been flagged by our content moderation policy."
  When I click selector "[aria-label='show message']"
  Then I wait until element ".uitest-profane-feedback-footer" contains text "Was this content flagged correctly?"
  When I click selector "[aria-label='thumbs up']"
  Then I wait until element ".uitest-profane-feedback-footer" contains text "This content was flagged correctly."

  # Teacher can interact with student model.
  Given element ".uitest-temperature-container" contains text "0.7"
  When I press the last button with text "Test student model"
  And I press keys "Hello" for element "#uitest-chat-textarea"
  And I wait until element "#uitest-chat-submit" is enabled
  And I click selector "#uitest-chat-submit"
  Then I wait until element "[aria-label='AI bot chat message']" is visible
  And element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(224, 248, 249)"
