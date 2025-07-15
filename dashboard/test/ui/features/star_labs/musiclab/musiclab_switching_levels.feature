@eyes
Feature: Music Lab workspaces load between levels

Scenario: Load a level and load the next
  When I open my eyes to test "levelLoading"

  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/46/levels/4"
  And I rotate to landscape
  And I wait until element "[data-id='when-run-block']" is visible

  # Click on next level via progress bubble so we are not doing a hard refresh
  And I click selector "[title='Level 5 Lesson Music']"
  And I wait to see "#run-button"

  And I see no difference for "new level loading"
  And I close my eyes
