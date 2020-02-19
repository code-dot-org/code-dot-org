Feature: Artist Project

Scenario: Save Artist Project
  Given I am on "http://studio.code.org/projects/artist"
  And I get redirected to "/projects/artist/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  Then I open the topmost blockly category "Brushes"
  And I drag block matching selector "#draw-color" to block matching selector "#when_run"

  When I am not signed in
  And I open the project share dialog
  Then the project cannot be published

  And I navigate to the share URL
  And I wait until element "#visualization" is visible
  Then element "draw-color" is a child of element "when_run"
