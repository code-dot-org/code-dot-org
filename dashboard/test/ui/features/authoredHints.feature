@no_ie
Feature: Authored Hints

@skip
Scenario: View Authored Hints
  Given I am on "http://studio.code.org/s/allthethings/stage/6/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#lightbulb"

  # This level has a total of three authored hints
  Then the hint lightbulb shows 3 hints available

  When I view the instructions and old hints

  # No hints in the instructions dialog yet
  Then element ".authored-hints ol" does not exist
  And element ".qtip" is not visible

  # View the first hint
  When I press "hint-button"
  And I wait to see ".qtip"
  And I wait for 1 seconds

  Then element ".qtip" contains text "This is the first hint."
  And element ".qtip" contains text "It has some basic markup"
  And the hint lightbulb shows 2 hints available

  # Verify that it appears in the instructions dialog
  When I view the instructions and old hints

  Then I see jquery selector .authored-hints ol
  And element ".authored-hints ol" contains text "This is the first hint."
  And element ".authored-hints ol" contains text "It has some basic markup"

  # View the second hint verify that it contains an image
  When I wait to see "#prompt-table"
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

  Then element ".authored-hints" is visible
  And element ".authored-hints" contains text "This is the first hint"
  And element ".authored-hints" contains text "This is the second hint"
  And element ".authored-hints" contains text "This is the third and final hint"
  And element "#hint-button" does not exist
