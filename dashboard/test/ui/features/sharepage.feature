@no_mobile
Feature: Puzzle share page

Scenario: Share a flappy game, visit the share page, and visit the workspace
  Given I am on "http://studio.code.org/flappy/10?noautoplay=true"
  And I wait for the page to fully load
  And I close the instructions overlay if it exists
  And I've initialized the workspace with my flappy puzzle.

  Then I press "runButton"
  Then I press "rightButton"
  And I wait to see "#x-close"
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
  Given I am on "http://studio.code.org/s/artist/stage/1/puzzle/10?enableExperiments=projectGallery"
  And I wait for the page to fully load
  And I close the instructions overlay if it exists
  And I drag block "1" to block "12"

  When I press "runButton"
  And I wait to see a congrats dialog with title containing "Congratulations"
  And I press "save-to-gallery-button"
  And I wait until element "#save-to-gallery-button" contains text "Saved"

  Then I am on "http://studio.code.org/projects/"
  And I wait until element "table.projects" is visible
  And the project list contains 1 entry
  And the project at index 0 is named "Artist Project"

@as_student
Scenario: Share and save a playlab level to the project gallery
  Given I am on "http://studio.code.org/s/playlab/stage/1/puzzle/10?enableExperiments=projectGallery"
  And I wait for the page to fully load
  And I close the instructions overlay if it exists

  When I press "runButton"
  And I press "finishButton"
  And I wait to see a congrats dialog with title containing "Congratulations"
  And I press "save-to-gallery-button"
  And I wait until element "#save-to-gallery-button" contains text "Saved"

  Then I am on "http://studio.code.org/projects/"
  And I wait until element "table.projects" is visible
  And the project list contains 1 entry
  And the project at index 0 is named "Play Lab Project"
