@no_ie
Feature: Authored Hints

Scenario: View Authored Hints
  Given I am on "http://studio.code.org/s/allthethings/lessons/6/levels/2?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#lightbulb"

  # This level has a total of three authored hints
  Then the hint lightbulb shows 3 hints available

  # View the first hint
  When I view the next authored hint
  Then element ".csf-top-instructions" contains text "This is the first hint."
  And element ".csf-top-instructions" contains text "It has some basic markup"
  And the hint lightbulb shows 2 hints available

  # View the second hint verify that it contains an image
  When I view the next authored hint

  Then element ".csf-top-instructions" contains text "This is the second hint. It has a hint video."
  And I see jquery selector .csf-top-instructions img
  And the hint lightbulb shows 1 hints available

  # View the third and final hint. Verify that the lightbulb no longer
  # has a counter.
  When I wait for the hint image to load
  And I view the next authored hint

  Then element ".csf-top-instructions" contains text "This is the third and final hint. It doesn't have anything special."
  And the hint lightbulb shows no hints available

  # Finally, verify that further clicking the lightbulb has no effect
  When I press "lightbulb"
  Then element ".csf-top-instructions button:contains(Yes)" does not exist
