Feature: Minecraft CodeBuilder

Scenario: Importing an Agent level from a share link
  #
  # Create a new level source
  #
  Given I am on "http://studio.code.org/s/allthethings/stage/25/puzzle/2"
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible

  # close the video
  Then I press "x-close"
  And I drag block "13" to block "10"
  And I press "runButton"
  And I wait until element "#finishButton" is visible
  And I press "finishButton"
  And I wait until element "#sharing-input" is visible
  And I save the share URL

  #
  # Import level source into codebuilder
  #
  When I am on "http://studio.code.org/projects/minecraft_codebuilder/"
  And I get redirected to "/projects/minecraft_codebuilder/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible

  # We expect this to load the "Minecraft not connected" dialog, so close it
  Then I click selector "#close-popup"
  # Open the import dialog
  And I click selector ".project_import"
  And I wait until element "#share-link" is visible
  And I enter the last shared URL into input "#share-link"
  And I press "import-button"

  #
  # Verify import succeeded
  #
  When I get redirected away from the current page
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible

  Then block "2" is child of block "1"

Scenario: Importing an Agent level from a project link
  #
  # Create a new level source
  #
  Given I am on "http://studio.code.org/projects/minecraft_hero/"
  And I get redirected to "/projects/minecraft_hero/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And I press "x-close"
  And I close the instructions overlay if it exists
  And element "#runButton" is visible

  Then I drag block "1" to block "10"
  And I press "runButton"
  And I click selector ".project_share"
  And I wait until element "#sharing-input" is visible
  And I save the share URL

  #
  # Import level source into codebuilder
  #
  When I am on "http://studio.code.org/projects/minecraft_codebuilder/"
  And I get redirected to "/projects/minecraft_codebuilder/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible

  # We expect this to load the "Minecraft not connected" dialog, so close it
  Then I click selector "#close-popup"
  # Open the import dialog
  And I click selector ".project_import"
  And I wait until element "#share-link" is visible
  And I enter the last shared URL into input "#share-link"
  And I press "import-button"

  #
  # Verify import succeeded
  #
  When I get redirected away from the current page
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible

  Then block "2" is child of block "1"
