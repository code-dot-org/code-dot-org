# Brad (2018-11-14) Skip on IE due to webdriver exception
@no_ie
@no_mobile
Feature: Puzzle share page

Scenario: Share a flappy game, visit the share page, and visit the workspace
  Given I am on "http://studio.code.org/flappy/10?noautoplay=true"
  And I wait for the page to fully load
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

  Then block "14" is child of block "13"
  And block "15" is child of block "14"

@as_student
Scenario: Share and save an artist level to the project gallery
  Given I am on "http://studio.code.org/s/artist/lessons/1/levels/10"
  And I wait for the page to fully load
  And I drag block "1" to block "12"

  When I press "runButton"
  Then I press "finishButton"
  And I wait to see a congrats dialog with title containing "Congratulations"
  And I reopen the congrats dialog unless I see the sharing input
  And I press "publish-to-project-gallery-button"
  And I click selector "#publish-dialog-publish-button" once I see it
  And I wait until element "#publish-dialog-publish-button" is not visible
  # close the feedback dialog
  And I close the dialog
  And element ".modal-body" is not visible

  Then I am on "http://studio.code.org/projects/"
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "Artist Project"

  # Make sure the published project shows up in the public gallery

  Then I click selector "#uitest-gallery-switcher div:contains(Public Projects)"
  And I wait until element "#projects-page" is visible
  And I wait until element ".project_card:contains(Artist Project)" is visible
  And I sign out

  Then I am on "http://studio.code.org/projects/public"
  And I wait until element ".project_card:contains(Artist Project)" is visible

@as_student
Scenario: Share and save a playlab level to the project gallery
  Given I am on "http://studio.code.org/s/playlab/lessons/1/levels/10"
  And I wait for the page to fully load

  When I press "runButton"
  And I press "finishButton"
  And I wait to see a congrats dialog with title containing "Congratulations"
  And I reopen the congrats dialog unless I see the sharing input
  And I press "publish-to-project-gallery-button"
  And I click selector "#publish-dialog-publish-button" once I see it
  And I wait until element "#publish-dialog-publish-button" is not visible
  # close the feedback dialog
  And I close the dialog
  And element ".modal-body" is not visible

  Then I am on "http://studio.code.org/projects/"
  And I wait until element ".ui-personal-projects-table" is visible
  And the project table contains 1 row
  And the first project in the table is named "Play Lab Project"

  # Make sure the published project shows up in the public gallery

  Then I click selector "#uitest-gallery-switcher div:contains(Public Projects)"
  And I wait until element "#projects-page" is visible
  And I wait until element ".project_card:contains(Play Lab Project)" is visible
  And I sign out

  Then I am on "http://studio.code.org/projects/public"
  And I wait until element ".project_card:contains(Play Lab Project)" is visible
