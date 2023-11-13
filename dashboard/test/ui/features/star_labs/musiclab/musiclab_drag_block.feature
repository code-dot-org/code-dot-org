@no_mobile

Feature: Music Lab block can be dragged

Scenario Outline: Dragging play sound block
  Given I am on "<url>"
  Then I wait until I am on "<url>"
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
  Then I drag block "play-sound-block" to block "when-run-block"

  # There should now be a music timeline entry.
  And element ".timeline-element" is visible

Examples:
  | url                                                       | test_name               |
  | http://studio.code.org/s/allthethings/lessons/46/levels/4 | music lab script level  |
  | http://studio.code.org/projectbeats?show-video=false      | music lab incubator     |
