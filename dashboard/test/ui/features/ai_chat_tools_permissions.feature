@no_mobile

Feature: AI chat tools permissions

  Background:
    Given I clear all session cookies

  # Teacher assigns a course that does not have AI chat tools
  Scenario: Section with AI chat tools disabled by course
    Given I create a teacher named "Teacher_NoAI"
    And I create a new student section assigned to course "allthethingscourse" unit 1 and save the section
    And I create a student named "Student_NoAI"
    And I join the section

    # Student in section views assigned course, can complete level
    Given I sign in as "Student_NoAI"
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/3/levels/1"
    Then I wait to see "#runButton"

    # Student in section views AI optional level, should not see AI Tutor
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/18/levels/1?enableExperiments=legacy-lab-ai-tutor"
    Then I wait until element "#uitest-ai-tutor-container-legacy-labs" is not visible

    # Student in section views AI Chat Lab level, should not be able to chat
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/47/levels/2"
    Then I wait until element "#uitest-chat-textarea" is not visible

  # Teacher assigns a course that has AI chat tools optional
  Scenario: Section with AI chat tools optional and teacher later disables them
    Given I create a teacher named "Teacher_Optional"
    And I create a new student section assigned to course "allthethingscourse" unit 1 and save the section
    And I create a student named "Student_Optional"
    And I join the section

    # AI tools for the section are enabled automatically
    Given I sign in as "Student_Optional"
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/18/levels/1?enableExperiments=legacy-lab-ai-tutor"
    And I click selector "[aria-label='Open AI tutor']" once I see it
    Then I wait until element "#uitest-ai-tutor-container-legacy-labs" is visible
    And I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    Then I wait until element "[aria-label='AI bot chat message']" is visible

    # Student in section views AI Chat Lab level, can chat with AI Chat Lab
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/47/levels/2"
    And I press keys "Hi" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    Then I wait until element "[aria-label='AI bot chat message']" is visible

    # Teacher disables AI chat tools
    Given I sign in as "Teacher_Optional"
    And I am on "http://studio.code.org/teacher_dashboard/sections"
    And I click selector "#uitest-ai-chat-section-access-toggle" once I see it
    And I click selector "input[name='section_essential_ai_checkbox']" once I see it

    # Teacher sees alert (warns that disabling may block required AI features)
    Then I wait until element ".uitest-ai-chat-access-alert" is visible

    # Student in section views AI optional level, AI Tutor is disabled
    Given I sign in as "Student_Optional"
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/18/levels/1?enableExperiments=legacy-lab-ai-tutor"
    Then I wait until element "#uitest-ai-tutor-container-legacy-labs" is not visible

    # Student in section views AI Chat Lab level, should not be able to chat
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/47/levels/2"
    Then I wait until element "#uitest-chat-textarea" is not visible

  # Teacher assigns a course that has AI chat tools essential
  Scenario: Section with AI chat tools essential and teacher disables them
    Given I create a teacher named "Teacher_Essential"
    And I create a new student section assigned to course "allthethingscourse" unit 1 and save the section
    And I create a student named "Student_Essential"
    And I join the section

    # AI tools for the section are enabled automatically
    Given I sign in as "Student_Essential"
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/18/levels/1?enableExperiments=legacy-lab-ai-tutor"
    And I click selector "[aria-label='Open AI tutor']" once I see it
    Then I wait until element "#uitest-ai-tutor-container-legacy-labs" is visible
    And I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    Then I wait until element "[aria-label='AI bot chat message']" is visible

    # Student in section views AI Chat Lab level, can chat with AI Chat Lab
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/47/levels/2"
    And I press keys "Hi" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    Then I wait until element "[aria-label='AI bot chat message']" is visible

    # Teacher disables AI chat tools
    Given I sign in as "Teacher_Essential"
    And I am on "http://studio.code.org/teacher_dashboard/sections"
    And I click selector "#uitest-ai-chat-section-access-toggle" once I see it
    And I click selector "input[name='section_essential_ai_checkbox']" once I see it

    # Teacher sees warning
    Then I wait until element ".uitest-ai-chat-access-alert" is visible

    # Student in section views AI optional level, AI Tutor is disabled
    Given I sign in as "Student_Essential"
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/18/levels/1?enableExperiments=legacy-lab-ai-tutor"
    Then I wait until element "#uitest-ai-tutor-container-legacy-labs" is not visible

    # Student in section views AI Chat Lab level, should not be able to chat
    When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/47/levels/2"
    Then I wait until element "#uitest-chat-textarea" is not visible
