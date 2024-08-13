@no_mobile
Feature: Puzzle share page

Scenario: Share a flappy game, visit the share page, and visit the workspace
  Given I am on "http://studio.code.org/flappy/10?noautoplay=true"
  And I wait for the lab page to fully load
  And I've initialized the workspace with my flappy puzzle.

  Then I press "runButton"
  Then I press "rightButton"
  And I wait to see "#x-close"
  And I reopen the congrats dialog unless I see the sharing input
  Then I navigate to the share URL

  Then ensure Flappy gameState is WAITING
  Then I press "runButton"
  And ensure Flappy gameState is WAITING
  And I wait for 1 seconds
  And ensure Flappy tickCount is positive
  Then I simulate a mousedown on the svg
  And ensure Flappy gameState is ACTIVE

  And I select the "How it Works (View Code)" small footer item
  And I get redirected to "/edit" via "dashboard"
  And I wait to see "#codeWorkspace"
  And ensure Flappy gameState is WAITING
  When I press "runButton"
  Then ensure Flappy gameState is WAITING
  And I wait for 1 seconds
  And ensure Flappy tickCount is positive
  When I simulate a mousedown on the svg
  Then ensure Flappy gameState is ACTIVE

  Then block "flapHeight" is child of block "whenClick"
  And block "playSound" is child of block "flapHeight"

@as_student
Scenario: Share and save an artist level to the project gallery
  Given I am on "http://studio.code.org/s/artist/lessons/1/levels/10"
  And I wait for the lab page to fully load
  And I drag block "1" to block "12"

  When I press "runButton"
  Then I press "finishButton"
  And I wait to see a congrats dialog with title containing "Congratulations"
  And I reopen the congrats dialog unless I see the sharing input
  And I press "save-to-project-gallery-button"
  And I wait until element "#save-to-project-gallery-button" contains text "Added"
  # close the feedback dialog
  And I close the dialog
  And element ".modal-body" is not visible

  Then I am on "http://studio.code.org/projects/"
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "Artist Project"
  And I sign out
