Feature: Projects

Background:
  Given I am on "http://learn.code.org/p/artist"
  And I rotate to landscape
  And element "#runButton" is visible
  And element ".project_updated_at" has text "Not saved"

Scenario: Save Project
  Then I open the topmost blockly category "Color"
  And I drag block matching selector "#draw-color" to block matching selector "#when_run"
  And I press "runButton"
#  Then element ".project_updated_at" contains text "Saving..." # I think browserstack is too slow to catch this
  Then I wait until element ".project_updated_at" contains text "Saved"
  And I reload the page
  Then element "#draw-color" is a child of element "#when_run"
