Feature: Blockly Project

Scenario: Save Blockly Project
  And I am on "http://studio.code.org/projects/dance"
  And I get redirected to "/projects/dance/([^\/]*?)/edit" via "dashboard"
  And I wait for the lab page to fully load
  And I wait until I don't see selector "#p5_loading"
  And I select age 10 in the age dialog
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  When I add a "Dancelab_makeNewDanceSpriteGroup" block with id "studentSpriteGroup" to workspace
  And I connect block "studentSpriteGroup" inside block "setup"

  When I am not signed in
  And I open the project share dialog

  And I navigate to the share URL
  And I wait until element "#visualization" is visible
  Then block "studentSpriteGroup" is child of block "setup"