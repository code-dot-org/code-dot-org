Feature: Music Lab workspaces load between levels

Scenario: Ensure feedback message gets focus after keyboard nav run button
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/46/levels/2"
  And I rotate to landscape
  And I wait until element "[data-id='when-run-block']" is visible
  And element "#focusable-message" does not have focus
  # Press the run button and wait for the empty song to play
  And I press keys ":space"
  And I wait for 6 seconds
  And element "#focusable-message" has focus
