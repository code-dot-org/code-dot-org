# Temporarily skipping flaky test. Investigate and re-enable.
@skip
Feature: Musiclab timeline is keyboard navigable

@no_mobile
@no_safari
Scenario: Ensure users can navigate into and out of timeline, and between elements with arrows
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/46/levels/4"
  And I rotate to landscape
  And I wait until element "[data-id='when-run-block']" is visible
  # Open the first category.
  And I press the first ".blocklyTreeRow" element
  # Drag two "play sound" blocks and attach them to the "when run" block.
  Then I drag block "play_sound_at_current_location_simple2" to block "when-run-block"
  And I press the first ".blocklyTreeRow" element
  Then I drag block "play_sound_at_current_location_simple2" to block "play_sound_at_current_location_simple2"
  Then I move focus to "#timeline"
  And I press keys ":enter"
  # Check that the first timeline element has focus
  And element "[aria-label='drum_kit_disco']" has focus
  And I press keys ":arrow_right"
  # Check that focus moves away from first element
  And element "[aria-label='drum_kit_disco']" does not have focus
  # Check that a user can escape out of timeline mode back to timeline container
  And I press keys ":escape"
  And element "#timeline" has focus
