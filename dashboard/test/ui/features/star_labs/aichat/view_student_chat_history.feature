# student writes appropriate chat
# student writes inappropriate chat
# *** need to be able to stub inappropriate response? ***
# student sees inappropriate chat message?
Feature: Teacher viewing student chat history in AI Chat lab

Scenario: Teacher views student chat history
  Given I create a teacher named "Simone"
  And I give user "Simone" authorized teacher permission
  And I create a new student section assigned to "customizing-llms-2024" and save the section
  Given I create a student named "Hermione"
  And I join the section
  And I am on "http://studio.code.org/s/customizing-llms-2024/lessons/2/levels/2"
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
  And I wait until element "[aria-label='AI bot chat message']" is visible
  # Update to check for red background?
  Then element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(224, 248, 249)"
# teacher logs in
# teacher sees appropriate chat and message flagged as inappropriate
# teacher can unhide flagged message
# teacher can mark flagged message as appropriate
# teacher can mark unflagged message as inappropriate
# teacher can interact with student bot (all model stuff should be locked, cannot update)
