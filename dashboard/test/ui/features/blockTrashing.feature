Feature: Blocks can be trashed in certain circumstances

Background:
  Given I am on "http://learn.code.org/s/course2/stage/19/puzzle/2"
  # In this stage:
  # block 18 is the "when run" block
  # block 19 is an undeletable "set color" block
  # block 24 is a deletable "turn right" block

Scenario: Trash a deletable block by dragging it off the left edge
  When I drag block "24" to offset "-500, 0"
  Then block "24" has been deleted

Scenario: Try to trash an undeletable block by dragging it off the left edge
  When I drag block "19" to offset "-500, 0"
  Then block "19" has not been deleted
  And block "24" has not been deleted

Scenario: Try to trash a deleteable block that has an undeletable child by dragging it off the left edge
  When I drag block "24" above block "19"
  Then block "24" is child of block "18"
  Then block "19" is child of block "24"
  When I drag block "24" to offset "-500, 0"
  Then block "24" has not been deleted
  And block "19" has not been deleted

Scenario: Hotkey-delete a deletable block
  When I click block "24"
  And I press delete
  Then block "24" has been deleted

Scenario: Hotkey-delete an undeletable block
  When I click block "19"
  And I press delete
  Then block "19" has not been deleted

Scenario: Hotkey-delete a deletable block between undeletable blocks
  When I drag block "24" above block "19"
  Then block "24" is child of block "18"
  And block "19" is child of block "24"
  When I click block "24"
  And I press delete
  Then block "24" has been deleted
  And block "18" has not been deleted
  And block "19" has not been deleted
