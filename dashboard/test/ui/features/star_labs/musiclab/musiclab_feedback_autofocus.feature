Feature: Music Lab workspaces load between levels

@no_mobile
@no_safari
# TODO: This test has been flaky on Safari. Investigate and re-enable.
Scenario: Ensure feedback message gets focus after keyboard nav run button
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/46/levels/2"
  And I rotate to landscape
  And I wait until element "[data-id='when-run-block']" is visible
  And element "#focusable-feedback" does not have focus
  # Spacebar to play the empty song
  And I press keys ":space"
  And I wait for 6 seconds
  And element "#focusable-feedback" has focus
