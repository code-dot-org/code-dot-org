Feature: Make sure we can see the finish button for all LEVEL TYPE levels on small screens

  @no_mobile
  Scenario: Can see finish button for free play "Dance Party", "Artist", "Bounce" on small screens
    Given I create an authorized teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally" and go home

    And I check that the blockly free play level for "Dance Party" shows the finish button for small screens
    And I check that the blockly free play level for "Artist" shows the finish button for small screens
    And I check that the blockly free play level for "Bounce" shows the finish button for small screens
    And I check that the blockly free play level for "CS in Algebra" shows the finish button for small screens
    And I check that the blockly free play level for "Flappy" shows the finish button for small screens
    And I check that the blockly free play level for "Sprite Lab" shows the finish button for small screens

    And I check that the droplet free play level for "Game Lab" shows the finish button for small screens

    And I check that the minecraft free play level for "Minecraft Adventurer" shows the finish button for small screens

    # The following levels currently do not render finish button for small screens.
    # TODO: Fid this - https://codedotorg.atlassian.net/browse/LP-1318
    #And I check that the minecraft free play level for "Minecraft Heroes Journey" shows the finish button for small screens
    #And I check that the minecraft free play level for "Minecraft Designer" shows the finish button for small screens
    #And I check that the droplet free play level for "App Lab" shows the finish button for small screens


  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: Can see finish for free play levels on mobile
    Given I create an authorized teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally" and go home

    And I check that the blockly free play level for "Dance Party" shows the finish button for mobile screens
    And I check that the blockly free play level for "Artist" shows the finish button for mobile screens
    And I check that the blockly free play level for "CS in Algebra" shows the finish button for mobile screens
    And I check that the blockly free play level for "Flappy" shows the finish button for mobile screens
    And I check that the blockly free play level for "Sprite Lab" shows the finish button for mobile screens

    And I check that the droplet free play level for "Game Lab" shows the finish button for mobile screens

    And I check that the minecraft free play level for "Minecraft Adventurer" shows the finish button for mobile screens

    # The following levels currently do not render finish button for iphone, but do on ipad
    # TODO: Fid this - https://codedotorg.atlassian.net/browse/LP-1318
    #And I check that the blockly free play level for "Bounce" shows the finish button for mobile screens
    #And I check that the droplet free play level for "App Lab" shows the finish button for mobile screens
    #And I check that the minecraft free play level for "Minecraft Heroes Journey" shows the finish button for mobile screens
    #And I check that the minecraft free play level for "Minecraft Designer" shows the finish button for mobile screens

