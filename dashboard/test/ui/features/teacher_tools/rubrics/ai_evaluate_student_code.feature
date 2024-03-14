# AI evaluation is stubbed out in UI tests via the /api/test/ai_proxy/assessment route.
Feature: Evaluate student code against rubrics using AI
  # Make sure AI config files in S3 are parseable. Do this in a UI test because
  # we do not allow S3 access in unit tests. Only needs to be run in 1 browser.
  @chrome
  Scenario: Validate Rubric AI Config
    Given I validate rubric ai config for all lessons

  Scenario: Student code is evaluated by AI when student submits project
    Given I create a teacher-associated student named "Aiden"
    And I get debug info for the current user
    And I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "not_tried" for level 2

    # Student submits code
    When I ensure droplet is in text mode
    And I append text to droplet "// the quick brown fox jumped over the lazy dog.\n"
    And I click selector "#runButton"
    And I wait until element "#submitButton" is visible
    And I click selector "#submitButton"
    And I wait until element "#confirm-button" is visible
    And I click selector "#confirm-button" to load a new page

    # Teacher views student progress and floating action button
    When I sign in as "Teacher_Aiden"
    And I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And element "#sign_in_or_user" contains text "Teacher_Aiden"
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And element ".teacher-panel td:eq(1)" contains text "Aiden"
    And I click selector ".teacher-panel td:eq(1)" to load a new page
    And I wait for the page to fully load
    Then I verify progress in the header of the current page is "perfect_assessment" for level 2
    And element "#ui-floatingActionButton" is visible

    # Teacher views AI evaluation status in rubric header
    When I click selector "#ui-floatingActionButton"
    And I wait until element "#uitest-rubric-content" is visible
    And element ".uitest-run-ai-assessment" is disabled
    And element ".uitest-info-alert" is visible
    Then I wait until element ".uitest-info-alert" contains text "AI analysis already completed for this project."

    # Teacher views AI evaluation results in rubric
    And I wait until element "#uitest-next-goal" is visible
    And I click selector "#uitest-next-goal"
    And I wait until element ".uitest-learning-goal-title" is visible
    Then element ".uitest-learning-goal-title" contains text "Sprites"
    And I wait until element ".uitest-ai-assessment" is visible
    Then element ".uitest-ai-assessment" contains text "Aiden has achieved Extensive or Convincing Evidence"

  Scenario: Student code is evaluated by AI when teacher requests it
    Given I create a teacher-associated student named "Aiden"
    And I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "not_tried" for level 2

    # Student runs code
    When I ensure droplet is in text mode
    And I append text to droplet "// the quick brown fox jumped over the lazy dog.\n"
    And I click selector "#runButton"
    And I wait until element "#resetButton" is visible

    # Teacher views student progress and floating action button
    When I sign in as "Teacher_Aiden"
    And I am on "http://studio.code.org/home"
    And I wait until element "#homepage-container" is visible
    And element "#sign_in_or_user" contains text "Teacher_Aiden"
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And element ".teacher-panel td:eq(1)" contains text "Aiden"
    And I click selector ".teacher-panel td:eq(1)" to load a new page
    And I wait for the page to fully load
    #Then I verify progress in the header of the current page is "attempted_assessment" for level 2
    And element "#ui-floatingActionButton" is visible

    # Teacher views AI evaluation status in settings tab
    When I click selector "#ui-floatingActionButton"
    And I wait until element "#uitest-rubric-content" is visible
    And element ".uitest-run-ai-assessment" is enabled

    # Teacher runs AI evaluation
    When I click selector ".uitest-run-ai-assessment"
    Then I wait until element ".uitest-info-alert" is visible
    And I wait until element ".uitest-info-alert" contains text "AI analysis complete."

    # Teacher views AI evaluation results in rubric tab
    And I wait until element "#uitest-next-goal" is visible
    And I click selector "#uitest-next-goal"
    And I wait until element ".uitest-learning-goal-title" is visible
    Then element ".uitest-learning-goal-title" contains text "Sprites"
    And I wait until element ".uitest-ai-assessment" is visible
    Then element ".uitest-ai-assessment" contains text "Aiden has achieved Extensive or Convincing Evidence"
