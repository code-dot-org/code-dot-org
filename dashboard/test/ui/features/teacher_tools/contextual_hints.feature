Feature: Contextual Hints

Scenario: Blocks render in contextual hints
  Given I am on "http://studio.code.org/s/allthethings/lessons/6/levels/2?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait to see "#lightbulb"

  When I press "runButton"
  And I wait to see ".uitest-topInstructions-inline-feedback"

  Then element ".uitest-topInstructions-inline-feedback" contains text "Not quite. Try using a block you aren’t using yet."
  And the hint lightbulb shows 4 hints available

  When I view the next authored hint

  Then element ".csf-top-instructions" contains text "Try using a block like this to solve the puzzle."
  And I see jquery selector .csf-top-instructions .block-space

Scenario: Contextual hints in level without Authored Hints
  Given I am on "http://studio.code.org/s/allthethings/lessons/3/levels/6?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

  Then element "#lightbulb" does not exist

  When I press "runButton"
  And I wait to see ".uitest-topInstructions-inline-feedback"
  And I wait to see "#resetButton"

  Then I see "#lightbulb"
  And the hint lightbulb shows 1 hints available
