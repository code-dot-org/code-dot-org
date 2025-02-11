@no_mobile
@eyes
Feature: AI Differentiation Welcome - eyes
  Scenario: AI Differentiation Welcome

    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "csd3-2023" with teacher "Teacher_Sally"

    When I sign in as "Teacher_Sally" and go home
    Given I am on "http://studio.code.org/s/csd3-2023/lessons/3?enableExperiments=ai-differentiation"
    When I open my eyes to test "ai diff welcome"

    And I see no difference for "ai floating button"

    When I click selector "#ui-floatingActionButton" once I see it
    And I wait until element "#uitest-ai-diff-get-started" is visible
    And I see no difference for "get started"

    Then I click selector "#uitest-ai-diff-get-started" once I see it
    Then I wait until element "#uitest-ai-diff-option" is visible
    And I see no difference for "practice - none selected"

    Then I press the first "#uitest-ai-diff-option" element
    Then I click selector "#uitest-ai-diff-continue" once I see it
    Then I wait until element "#uitest-chat-textarea" is visible
    And I see no difference for "chat"

    When I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    And I wait until "#uitest-ai-diff-continue" is not disabled
    Then I click selector "#uitest-ai-diff-continue"
    Then I wait until element "#uitest-ai-diff-option" is visible
    And I wait until element "#uitest-ai-diff-finish" is visible
    And I see no difference for "end page"

    And I click selector "#uitest-ai-diff-finish"
    Then I wait until element "#uitest-chat-textarea" is visible
    And I see no difference for "after welcome"

    And I close my eyes







