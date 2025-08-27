# AI Diff chat is stubbed out in UI tests in ai_diff_bedrock_helper.rb
@no_firefox
@no_mobile
Feature: Send and receive messages in the AI differentiation chat
  @eyes
  @chrome
  Scenario: Teacher sees welcome screen for AI Differentiation
    Given I create a teacher named "Stilgar"
    And I add the current user to the "ai-differentiation" single user experiment

    # Teacher views lesson page and floating action button
    When I sign in as "Stilgar"
    And I get debug info for the current user
    And I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And element "#sign_in_or_user" contains text "Stilgar"
    # Close the FAB
    And I wait until element "#ui-floatingActionButton" is visible
    When I click selector "#ui-floatingActionButton"
    And I wait until element "button:contains(Get Started)" is not visible

    #Go to curriculum page
    And I am on "http://studio.code.org/courses/csp-2025?enableExperiments=ai-diff-sidebar"
    And I wait until element "#ui-floatingActionButton" is visible
    #wait for pulse to finish
    And I wait for 5 seconds
    And I open my eyes to test "ai diff welcome and chat"
    Then I see no difference for "ai diff floating action button icon"

    # Teacher views AI Diff chat welcome
    When I click selector "#ui-floatingActionButton"
    And I wait until element "button:contains(Get Started)" is visible
    Then I see no difference for "ai diff welcome get started page"
    #put eyes here
    And I click selector "button:contains(Get Started)"
    And I wait until element "button:contains(Create)" is visible
    Then I see no difference for "ai diff welcome pick a skill"
    #eyes here
    And I click selector "button:contains(Create)"
    And I wait until element "#uitest_aiDiffWelcomeContinue" is enabled
    Then I see no difference for "ai diff welcome create"
    #eyes here
    And I click selector "#uitest_aiDiffWelcomeContinue"
    And I click selector "input[value='Write an extension activity for students who finish early']" once I see it
    And I wait until element "p:contains(Lorem ipsum)" is visible
    And I wait until element "#uitest-chat-textarea" has focus
    Then I see no difference for "ai diff welcome create chat"
    #eyes here
    And I click selector "#uitest_aiDiffWelcomeContinue"
    # wait for confetti animation to finish
    And I wait for 3 seconds
    Then I see no difference for "ai diff welcome finish"

    And I click selector "button:contains(Finish)" once I see it

    #Now we see the regular AI diff chat (with thread sidebar)
    And I wait until element "input[value='Give me an example']" is visible
    Then I see no difference for "ai diff chat initial view"

    And I click selector "#uitest-chat-textarea" once I see it
    And I press keys "Which lessons have a project" for element "#uitest-chat-textarea"
    And I wait until element "textarea:contains(Which lessons have a project)" is visible
    And I click selector "#uitest-chat-submit"
    Then element "[aria-label='User chat message']" has text "Which lessons have a project"
    And I wait until element "p:contains(Lorem ipsum)" is visible
    Then I see no difference for "ai diff one dialog turn"
    Then I close my eyes

  @chrome
  @properties_encryption_key
  Scenario: Teacher can type messages and leave feedback in AI Differentiation chat
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
    And I click selector "#uitest-chat-textarea" once I see it
    And I press keys "Which lessons have a project" for element "#uitest-chat-textarea"
    And I wait until element "textarea:contains(Which lessons have a project)" is visible
    And I click selector "#uitest-chat-submit"
    Then element "[aria-label='User chat message']" has text "Which lessons have a project"
    And I wait until element "p:contains(Lorem ipsum)" is visible

    # Clicking "suggest prompts" gives another set of prompts
    And I click selector "button:contains(Suggest prompts)"
    And I click selector "input[value='Write a lesson hook']" once I see it
    And I wait until I see 2 of jquery selector p:contains(Lorem ipsum)

    # Clicking the feedback buttons works
    And I click selector "button[aria-label='Give this message a thumbs up']:eq(2)"
    And I wait up to 5 seconds for element "i.fa-regular.fa-thumbs-up:eq(2)" to have css property "color" equal to "rgb(62, 163, 62)"

  @chrome
  Scenario: Teacher can disable AI chat feature
    Given I create a teacher named "Stilgar"
    And I add the current user to the "ai-differentiation" single user experiment

    # Teacher views lesson page and floating action button
    When I sign in as "Stilgar"
    And I get debug info for the current user
    And I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And element "#sign_in_or_user" contains text "Stilgar"
    And element "#ui-floatingActionButton" is visible

    # Teacher sees and skips AI Diff chat welcome
    And I wait until element "button:contains(Get Started)" is visible
    And I click selector "button:contains(Get Started)"
    And I click selector "a:contains('Skip the tutorial')" once I see it

    # Typing a chat message
    And I wait until element "button:contains(Suggest prompts)" is visible
    And I click selector "#uitest-chat-textarea" once I see it
    And I press keys "How do I add a classroom section" for element "#uitest-chat-textarea"
    And I wait until element "textarea:contains(How do I add a classroom section)" is visible
    And I click selector "#uitest-chat-submit"
    And I wait until element "p:contains(Lorem ipsum)" is visible

    # Toggling the ai chat feature on the edit page removes the floating action button
    When I am on "http://studio.code.org/users/edit"
    And I click selector "input[name='aiTeacherDiffToggle']" once I see it

    When I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And element "#ui-floatingActionButton" does not exist
