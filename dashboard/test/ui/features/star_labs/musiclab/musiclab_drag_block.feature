@no_mobile
@no_safari
# TODO: This test has been flaky on Safari. Investigate and re-enable.

Feature: Music Lab block can be dragged

Scenario Outline: Dragging play sound block
  Given I am on "<url>"

  # Ensure that the pack dialog doesn't show by using a library with no restricted packs.
  Then I append "?library=intro2024" to the URL

  # Rotate to landscape.
  And I rotate to landscape

  # Wait until we see the first category.
  And I wait until element ".blocklyTreeRow" is visible

  # Also wait until we see the "when run" block.
  And I wait until element "[data-id='when-run-block']" is visible

  # There should be no music timeline entry yet.
  And element ".timeline-element" is not visible

  # Open the first category.
  And I press the first ".blocklyTreeRow" element

  # Drag the "play sound" block and attach it to the "when run" block.
  Then I drag block "play_sound_at_current_location_simple2" to block "when-run-block"

  # There should now be a music timeline entry.
  And element ".timeline-element" is visible

  # Click the field inside the attached "play sound" block.
  And I click block field "[data-id='when-run-block'] > [data-id='play_sound_at_current_location_simple2'] > .blocklyEditableText"

  # Click on the second pack inside the sounds panel.
  And I click selector "#sounds-panel .sounds-panel-folder-row:nth-of-type(2)"

  # Click on the second sound inside the sounds panel.
  And I click selector "#sounds-panel .sounds-panel-sound-row:nth-of-type(2)"

  # Dismiss the sounds panel.
  And I press keys ":escape"

  # The sounds panel should be dismissed.
  And I wait until element "#sounds-panel" is not visible

  # There should still be a music timeline entry.
  And element ".timeline-element" is visible

Examples:
  | url                                                       | test_name               |
  | http://studio.code.org/s/allthethings/lessons/46/levels/4 | music lab script level  |
  | http://studio.code.org/projects/music/new                 | music lab project       |
