Feature: Blocks can be trashed in certain circumstances

Background:
  Given I am on "http://learn.code.org/s/course2/stage/19/puzzle/2"
  And I rotate to landscape
  And I wait to see ".markdown-level-header-text"
  Then element ".markdown-level-header-text" has text "Puzzle 2 of 13"
  And I close the dialog
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  # In this level's initial setup:
  And "when_run" refers to block "17"
  And "gray set_color" refers to block "18"
  And "turn_right" refers to block "23"

Scenario: Drag-delete a deletable block
  When I drag block "turn_right" to offset "-2000, 0"
  Then block "turn_right" has been deleted

Scenario: Fail to drag-delete an undeletable block
  When I drag block "gray set_color" to offset "-2000, 0"
  Then block "gray set_color" has not been deleted
  And block "turn_right" has not been deleted

Scenario: Fail to drag-delete a deleteable block that has an undeletable child
  When I drag block "turn_right" to block "when_run"
  Then block "turn_right" is child of block "when_run"
  Then block "gray set_color" is child of block "turn_right"
  When I drag block "turn_right" to offset "-2000, 0"
  Then block "turn_right" has not been deleted
  And block "gray set_color" has not been deleted

Scenario: Delete on drag off top-left
  When I drag block "turn_right" to offset "-2000, -2000"
  Then block "turn_right" has been deleted

Scenario: Delete on drag off left
  When I drag block "turn_right" to offset "-2000, 0"
  Then block "turn_right" has been deleted

Scenario: Delete on drag off bottom-left
  When I drag block "turn_right" to offset "-2000, 2000"
  Then block "turn_right" has been deleted

Scenario: Bump on drag off top
  When I drag block "turn_right" to offset "0, -2000"
  Then block "turn_right" has not been deleted
  And block "turn_right" is visible in the workspace

Scenario: Bump on drag off top-right
  When I drag block "turn_right" to offset "2000, -2000"
  Then block "turn_right" has not been deleted
  And block "turn_right" is visible in the workspace

Scenario: Bump on drag off right
  When I drag block "turn_right" to offset "2000, 0"
  Then block "turn_right" has not been deleted
  And block "turn_right" is visible in the workspace

  Scenario: Bump on drag off bottom-right
    When I drag block "turn_right" to offset "2000, 2000"
    Then block "turn_right" has not been deleted
    And block "turn_right" is visible in the workspace

Scenario: Bump on drag off bottom
  When I drag block "turn_right" to offset "0, 2000"
  Then block "turn_right" has not been deleted
  And block "turn_right" is visible in the workspace

# The following scenarios are disabled on mobile because we don't
# particularly care about hotkeys in a touchscreen-only context.
@no_mobile
Scenario: Hotkey-delete a deletable block
  When I click block "turn_right"
  And I press delete
  Then block "turn_right" has been deleted

@no_mobile
Scenario: Fail to hotkey-delete an undeletable block
  When I click block "gray set_color"
  And I press delete
  Then block "gray set_color" has not been deleted

@no_mobile
Scenario: Hotkey-delete a deletable block between undeletable blocks
  When I drag block "turn_right" to block "when_run"
  Then block "turn_right" is child of block "when_run"
  And block "gray set_color" is child of block "turn_right"
  When I click block "turn_right"
  And I press delete
  Then block "turn_right" has been deleted
  And block "when_run" has not been deleted
  And block "gray set_color" has not been deleted
