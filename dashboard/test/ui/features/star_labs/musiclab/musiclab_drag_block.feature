Feature: Music Lab block can be dragged

Scenario: Dragging play sound block
  Given I am on "http://studio.code.org/s/allthethings/lessons/46/levels/1?show-video=false"
  Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/46/levels/1?show-video=false"
  And I rotate to landscape

  # Wait until we see the first category.
  And I wait until element "#blockly-0" is visible

  # Also wait until we see the "when run" block.
  And I wait until element "[data-id='when-run-block']" is visible

  # There should be no music timeline entry yet.
  And element ".timeline-element" is not visible

  # Open the first category.
  And I press "blockly-0"

  # Drag the "play sound" block and attach it to the "when run" block.
  Then I drag block "play-sound-block" to block "when-run-block"

  # There should now be a music timeline entry.
  And element ".timeline-element" is visible
