Feature: Make sure we can see the finish button for all LEVEL TYPE levels on small screens

  Background:
    Given I create an authorized teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally" and go home

  @no_mobile
  Scenario: can see finish button on "Dance Party"
    And I check that the blockly free play level for "Dance Party" shows the finish button for small screens

  @no_mobile
  Scenario: can see finish button on "Artist"
    And I check that the blockly free play level for "Artist" shows the finish button for small screens

  @no_mobile
  Scenario: can see finish button on "Bounce"
    And I check that the blockly free play level for "Bounce" shows the finish button for small screens

  @no_mobile
  Scenario: can see finish button on "CS in Algebra"
    And I check that the blockly free play level for "CS in Algebra" shows the finish button for small screens

  @no_mobile
  Scenario: can see finish button on "Flappy"
    And I check that the blockly free play level for "Flappy" shows the finish button for small screens

  @no_mobile
  Scenario: can see finish button on "Sprite Lab"
    And I check that the blockly free play level for "Sprite Lab" shows the finish button for small screens

  @no_mobile
  Scenario: can see finish button on "Game Lab"
    And I check that the droplet free play level for "Game Lab" shows the finish button for small screens

  @no_mobile
  Scenario: can see finish button on "Minecraft Adventurer"
    And I check that the minecraft free play level for "Minecraft Adventurer" shows the finish button for small screens

  # The following levels currently do not show finish button
  # in the viewport when play is pressed for small screens.

  # TODO: Fix this - https://codedotorg.atlassian.net/browse/LP-1318
    # "Minecraft Heroes Journey"
    # "Minecraft Designer"
    # "App Lab"

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: can see finish button on "Dance Party"
    And I check that the blockly free play level for "Dance Party" shows the finish button for mobile screens

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: can see finish button on "Artist"
    And I check that the blockly free play level for "Artist" shows the finish button for mobile screens

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: can see finish button on "CS in Algebra"
    And I check that the blockly free play level for "CS in Algebra" shows the finish button for mobile screens

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: can see finish button on "Flappy"
    And I check that the blockly free play level for "Flappy" shows the finish button for mobile screens

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: can see finish button on "Sprite Lab"
    And I check that the blockly free play level for "Sprite Lab" shows the finish button for mobile screens

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: can see finish button on "Game Lab"
    And I check that the droplet free play level for "Game Lab" shows the finish button for mobile screens

  # Minecraft is tested in its own feature under /craft/ because when run with other scenarios,
  # it often causes difficult-to-find memory errors due to the high memory usage of minecraft.

  # The following levels currently do not show finish button
  # in the viewport when play is pressed for iphone, but do on ipad

  # TODO: Fix # this - https://codedotorg.atlassian.net/browse/LP-1318
    # "Minecraft Heroes Journey"
    # "Minecraft Designer"
    # "App Lab"
    # "Bounce"
