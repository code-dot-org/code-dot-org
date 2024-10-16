@no_mobile
Feature: Announcement for AI Assessments
  Scenario: Teacher views and closes announcement
    Given I am a teacher

    # no announcement on non-ai units
    When I am on "http://studio.code.org/s/flappy"
    Then I wait until element "#uitest-no-ai-assessments-announcement" is visible

    # announcement visible on ai unit
    When I am on "http://studio.code.org/s/interactive-games-animations-2024"
    Then I wait until element "#uitest-ai-assessments-announcement" is visible

    # announcement is not visible after closing
    When I click selector "#ui-close-dialog"
    Then I wait until element "#uitest-ai-assessments-announcement" is not visible
    And I wait until ai assessments announcement is marked as seen

    # announcement still not visible after reloading the page
    When I reload the page
    Then I wait until element "#uitest-no-ai-assessments-announcement" is visible

  Scenario: Teacher views announcement and clicks learn more
    Given I am a teacher
    When I am on "http://studio.code.org/s/interactive-games-animations-2024"
    Then I wait until element "#uitest-ai-assessments-announcement" is visible

    # announcement is not visible after clicking button to navigate
    When I click selector "#uitest-ai-assessments-announcement .learn-more-button" to load a new page
    And I am on "http://studio.code.org/s/interactive-games-animations-2024"
    Then I wait until element "#uitest-no-ai-assessments-announcement" is visible
