@no_ie
Feature: Authored Hints

Scenario: View Authored Hints
  Given I am on "http://learn.code.org/s/allthethings/stage/6/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I wait to see "#prompt-table"

  # This level has a total of three authored hints
  Then the hint lightbulb shows 3 hints available

  When I press "prompt-table"
  And I wait to see ".qtip"

  Then element ".qtip a.show-instructions" has text "Instructions and old hints"
  And element ".qtip a.show-hint" has text "Get a new hint"

  When I press the first ".qtip a.show-instructions" element
  And I wait to see a dialog titled "Puzzle 2 of 2"
  And I wait for 2 seconds

  # No hints in the instructions dialog yet
  Then element ".authored-hints ol" does not exist
  And element ".qtip" is not visible

  # View the first hint
  When I close the dialog
  And I wait to see "#prompt-table"
  And I view the next authored hint

  Then element ".qtip" contains text "This is the first hint."
  And element ".qtip" contains text "It has some basic markup"
  And the hint lightbulb shows 2 hints available

  # Verify that it appears in the instructions dialog
  When I view the instructions and old hints
  And I wait to see a dialog titled "Puzzle 2 of 2"

  Then I see jquery selector .authored-hints ol
  And element ".authored-hints ol" contains text "This is the first hint."
  And element ".authored-hints ol" contains text "It has some basic markup"

  # View the second hint verify that it contains an image
  When I close the dialog
  And I wait to see "#prompt-table"
  And I view the next authored hint

  Then element ".qtip" contains text "This is the second hint. It has an image."
  And I see jquery selector .qtip img
  And the hint lightbulb shows 1 hints available

  # View the third and final hint. Verify that the lightbulb no longer
  # has a counter.
  When I wait for the hint image to load
  And I view the next authored hint

  Then element ".qtip" contains text "This is the third and final hint. It doesn't have anything special."
  And the hint lightbulb shows no hints available

  # Finally, verify that further clicking directly opens the
  # instructions dialog without the "Instructions or Hint option". Also
  # verify that all three hints are in the dialog.
  When I press "prompt-table"
  And I wait to see a dialog titled "Puzzle 2 of 2"

  Then element ".authored-hints" is visible
  And element ".authored-hints" contains text "This is the first hint"
  And element ".authored-hints" contains text "This is the second hint"
  And element ".authored-hints" contains text "This is the third and final hint"
