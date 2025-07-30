Feature: Musiclab timeline is keyboard navigable

@no_mobile
Scenario: Ensure users can navigate into and out of timeline, and between elements with arrows
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/46/levels/7"
  And I rotate to landscape
  And I wait until element "[data-id='when-run-block']" is visible
  And I drag block "2" to block "when run"
  And I drag block "1" to block "when run"
  Then I move focus to ".timeline"
  And I press keys ":enter"
  # Check that the first timeline element has focus
  And element "[aria-label='drum_beat_cowbell']" has focus
  And I press keys ":arrow_right"
  # Check that focus moves away from first element
  And element "[aria-label='drum_beat_cowbell']" does not have focus
  # Check that a user can escape out of timeline mode back to timeline container
  And I press keys ":escape"
  And element ".timeline" has focus
