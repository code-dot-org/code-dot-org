# AI Diff chat is stubbed out in UI tests in ai_diff_bedrock_helper.rb
@no_firefox
@no_mobile
Feature: Read and create AI diff threads
  @eyes
  @chrome
  @properties_encryption_key
  Scenario: Teacher can see threads and create new threads
    Given I create a teacher named "Stilgar"
    And I add the current user to the "ai-differentiation" single user experiment

    # Teacher views lesson page and floating action button
    When I sign in as "Stilgar"
    And I get debug info for the current user
    And I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And element "#sign_in_or_user" contains text "Stilgar"
    And I am on "http://studio.code.org/courses/csp-2025/units/4"
    And I wait until element "#ui-floatingActionButton" is visible

    # Teacher sees and skips AI Diff chat welcome
    And I wait until element "button:contains(Get Started)" is visible
    And I click selector "button:contains(Get Started)"
    And I wait until element "button:contains(Create)" is visible
    And I click selector "a:contains('Skip the tutorial')"

    # Typing a chat message
    And I wait until element "#uitest-chat-textarea" is visible
    And I open my eyes to test "ai diff threads"
    Then I see no difference for "ai diff threads starting state"
    And I click selector "#uitest-chat-textarea" once I see it
    And I press keys "Which lessons have a project" for element "#uitest-chat-textarea"
    And I wait until element "textarea:contains(Which lessons have a project)" is visible
    And I click selector "#uitest-chat-submit"
    Then element "[aria-label='User chat message']" has text "Which lessons have a project"
    And I wait until element "p:contains(Lorem ipsum)" is visible
    And I wait until element "#uitest-chat-textarea" has focus

    # There is now a new thread with the message as the title
    And I wait until element "li:contains(Which lessons have a project)" is visible

    # Click the "new thread" button in the sidebar, type new message
    And I click selector "button:contains(New Chat)"
    And I wait until element "p:contains(Hi! I'm your AI Teaching Assistant)" is visible
    Then element "input[value='Give me an example']" is visible
    And element "[aria-label='User chat message']" is not visible
    Then I see no difference for "ai diff threads new thread from button"
    And I click selector "#uitest-chat-textarea" once I see it
    And I press keys "How do I debug" for element "#uitest-chat-textarea"
    And I wait until element "textarea:contains(How do I debug)" is visible
    And I click selector "#uitest-chat-submit"
    Then element "[aria-label='User chat message']" has text "How do I debug"
    And I wait until element "p:contains(Lorem ipsum)" is visible

    # There is now a new thread with the message as the title
    And I wait until element "li:contains(How do I debug)" is visible

    # Click the first thread we created again to see the messages
    And I click selector "span:contains(Which lessons have a project)" once I see it
    And I wait until element "[aria-label='User chat message']:contains(Which lessons have a project)" is visible
    And element "p:contains(Lorem ipsum)" is visible
    Then I see no difference for "ai diff threads display old thread"

    # Clicking "suggest prompts" gives another set of prompts
    And I click selector "button:contains(Suggest prompts)"
    And I click selector "input[value='Write a lesson hook']" once I see it
    And I wait until I see 2 of jquery selector p:contains(Lorem ipsum)
    Then I see no difference for "ai diff threads continue old thread"
    Then I close my eyes
