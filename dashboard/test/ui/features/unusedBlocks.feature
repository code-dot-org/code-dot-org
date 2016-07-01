Feature: Unused Blocks

@eyes
Scenario: Solve a level with unused blocks
  Given I am on "http://learn.code.org/s/allthethings/stage/4/puzzle/4?noautoplay=true&enableExperiments=unusedBlocks"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

  When I open my eyes to test "Unused Blocks"

  # Drag a block into the middle of the workspace
  When I drag block "1" to offset "200, 400"

  Then I see no difference for "unattached block before running"

  # Run and retry
  When I press "runButton"
  And I wait to see "#again-button"
  And I press "again-button"
  And I wait to see ".blocklyHelp"

  # Block should now have an "unused code" container
  Then I see no difference for "unattached block after running"

  # The element in question will not respond to simple jQuery triggers,
  # as the event is bound by Blockly, which binds at a lower level.
  # Thus, we have to actually explicitly simulate a mousedown event
  And execute JavaScript expression "$('.blocklyHelp')[0].dispatchEvent(new MouseEvent('mousedown'))"

  When I wait to see ".qtip"

  Then I see no difference for "unattached block tooltip"
  And I close my eyes
