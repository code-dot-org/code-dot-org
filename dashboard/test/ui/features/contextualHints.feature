@no_ie
Feature: Contextual Hints

Scenario: Hints viewed in feedback don't become contextual hints
  Given I am on "http://learn.code.org/s/allthethings/stage/6/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I wait to see "#prompt-table"

  # This level has a total of three authored hints
  Then the hint lightbulb shows 3 hints available

  When I press "runButton"
  And I wait to see ".congrats"

  Then element "#hint-request-button" is visible

  When I press "again-button"
  And I wait to see "#resetButton"

  # This level has two recommended blocks, the first of which now
  # appears as a hint
  Then the hint lightbulb shows 4 hints available

  When I press "resetButton"
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element "#hint-request-button" is visible

  When I press "hint-request-button"
  And I wait to see ".congrats"
  And I wait to see "#feedbackBlocks"
  And I press "again-button"
  And I wait to see "#resetButton"

  # I viewed the hint in the feedback, so now there are only three
  Then the hint lightbulb shows 3 hints available

Scenario: Blocks render in contextual hints
  Given I am on "http://learn.code.org/s/allthethings/stage/6/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I wait to see "#prompt-table"

  When I press "runButton"
  And I wait to see ".congrats"
  And I press "again-button"
  And I wait to see "#resetButton"

  Then the hint lightbulb shows 4 hints available

  When I view the next authored hint

  Then element ".qtip" contains text "Try using a block like this to solve the puzzle."
  # the block renders in the qtip
  And I see jquery selector .qtip svg

  When I view the instructions and old hints
  And I wait to see a dialog titled "Puzzle 2 of 2"

  Then I see jquery selector .authored-hints ol
  # the block renders when opening the instructions
  And I see jquery selector .authored-hints ol .block-space:eq(0) svg

Scenario: Contextual hints in level without Authored Hints
  Given I am on "http://learn.code.org/s/allthethings/stage/4/puzzle/5?noautoplay=true"
  And I rotate to landscape
  And I close the dialog

  Then element "#lightbulb" does not exist

  When I press "runButton"
  And I wait to see ".congrats"
  And I press "again-button"
  And I wait to see "#resetButton"

  Then the hint lightbulb shows 1 hints available
