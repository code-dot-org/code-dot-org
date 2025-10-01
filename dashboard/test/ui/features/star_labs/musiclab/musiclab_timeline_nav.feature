Feature: Musiclab timeline is keyboard navigable

@no_mobile
@no_safari
Scenario: Ensure users can navigate into and out of timeline, and between elements with arrows
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/46/levels/6"
  And I rotate to landscape
  And I wait until element "[data-id='when-run-block']" is visible
  Then I move focus to "#timeline"
  And I press keys ":enter"
  # Check that the first timeline element has focus
  And I wait until element "[aria-label='drum_beat_cowbell']" has focus
  And I press keys ":arrow_right"
  # Check that focus moves away from first element
  Then element "[aria-label='drum_beat_cowbell']" does not have focus
  # Check that a user can escape out of timeline mode back to timeline container
  And I press keys ":escape"
  And I wait until element "#timeline" has focus
