Feature: Authored Hints

Scenario: View Authored Hints
  Given I am on "http://learn.code.org/s/allthethings/stage/6/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog
  And I wait to see "#prompt-table"

  # This level has a total of three authored hints
  Then element "#lightbulb" is visible
  And element "#hintCount" is visible
  And element "#hintCount" has text "3"

  When I press "prompt-table"
  And I wait to see ".qtip"

  Then element ".qtip" is visible
  And element ".qtip a.show-instructions" has text "Instructions and old hints"
  And element ".qtip a.show-hint" has text "Get a new hint"

  When I press the first ".qtip a.show-instructions" element
  And I wait to see a dialog titled "Puzzle 2 of 2"

  # No hints in the instructions dialog yet
  Then element ".authored-hints" does not exist
  And element ".qtip" is not visible

  When I close the dialog
  And I wait to see "#prompt-table"
  And I press "prompt-table"
  And I wait to see ".qtip"

  Then element ".qtip" is visible
  And element ".qtip a.show-hint" is visible

  # View the first hint
  When I press the first ".qtip a.show-hint" element
  And I wait to see ".qtip"

  Then element ".qtip" is visible
  And element ".qtip" contains text "This is the first hint."
  And element ".qtip" contains text "It has some basic markup"
  And element "#lightbulb" is visible
  And element "#hintCount" is visible
  And element "#hintCount" has text "2"

  When I press "prompt-table"
  And I wait to see ".qtip"

  Then element ".qtip" is visible
  And element ".qtip a.show-instructions" is visible

  # Verify that it appears in the instructions dialog
  When I press the first ".qtip a.show-instructions" element
  And I wait to see a dialog titled "Puzzle 2 of 2"

  Then element ".authored-hints" is visible
  And element ".authored-hints" contains text "This is the first hint."
  And element ".authored-hints" contains text "It has some basic markup"

  # View the second hint verify that it contains an image
  When I close the dialog
  And I wait to see "#prompt-table"
  And I press "prompt-table"
  And I wait to see ".qtip"
  And I press the first ".qtip a.show-hint" element
  And I wait to see ".qtip"

  Then element ".qtip" is visible
  And element ".qtip" contains text "This is the second hint. It has an image."
  And I see jquery selector .qtip img
  And element "#lightbulb" is visible
  And element "#hintCount" is visible
  And element "#hintCount" has text "1"

  # View the third and final hint. Verify that the lightbulb no longer
  # has a counter
  When I press "prompt-table"
  And I wait to see ".qtip"
  And I press the first ".qtip a.show-hint" element
  And I wait to see ".qtip"

  Then element ".qtip" is visible
  And element ".qtip" contains text "This is the third and final hint. It doesn't have anything special."
  And element "#lightbulb" is visible
  And element "#hintCount" does not exist

  # Finally, verify that further clicking directly opens the
  # instructions dialog without the "Instructions or Hint option". Also
  # verify that all three hints are in the dialog.
  When I press "prompt-table"
  And I wait to see a dialog titled "Puzzle 2 of 2"

  Then element ".authored-hints" is visible
  And element ".authored-hints" contains text "This is the first hint"
  And element ".authored-hints" contains text "This is the second hint"
  And element ".authored-hints" contains text "This is the third and final hint"
