Feature: Teaching Assistant
  Scenario: Student in experiment can make progress on AI-enabled level
    Given I create a teacher-associated student named "Aiden"
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "not_tried" for level 2

    When I ensure droplet is in text mode
    And I append text to droplet "// the quick brown fox jumped over the lazy dog.\n"
    And I click selector "#runButton"
    And I wait until element "#submitButton" is visible
    And I click selector "#submitButton"
    And I wait until element "#confirm-button" is visible
    And I click selector "#confirm-button" to load a new page

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
    And I click selector "#ui-floatingActionButton"
    And I wait until element ".uitest-rubric-header-tab:contains('Settings')" is visible
    And I click selector ".uitest-rubric-header-tab:contains('Settings')"
    And I wait until element ".uitest-rubric-settings" is visible
    And element ".uitest-eval-status-text" is visible
    And element ".uitest-eval-status-text" contains text "AI analysis already completed for this project."

    When I click selector ".uitest-rubric-header-tab:contains('Rubric')"
    And I wait until element ".uitest-learning-goal" is visible
    And element ".uitest-uses-ai" is visible
    And I click selector ".uitest-uses-ai:eq(0)"
    And I wait until element ".uitest-ai-assessment" is visible
    And element ".uitest-ai-assessment" contains text "Aiden has achieved Extensive or Convincing Evidence"
