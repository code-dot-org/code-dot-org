@no_mobile
Feature: Using the Internet Simulator Lobby

  The internet simulator lets students experiment with a simulated network environment, connecting
  to one another through our system and sending data back and forth with different encodings.

  Scenario: First user in bit-sending mode can reach lobby
    Given I am on the 1st NetSim test level
    And I wait up to 5 seconds for element ".modal" to be visible
    And I close the dialog

    And I enter the netsim name "Erin"
    And I wait until element ".netsim-lobby-panel" is visible
    Then element ".netsim-lobby-panel" contains text "Erin"

  Scenario: When not logged in, can connect to a router
    Given I am on the 4th NetSim test level
    And I wait up to 5 seconds for element ".modal" to be visible
    And I close the dialog
    And I wait until element "#netsim-lobby-name" is visible

    Then element "#netsim-lobby-name" is enabled
    And element "#netsim-lobby-set-name-button" is visible
    And element "#netsim-lobby-set-name-button" is disabled
    And element "#netsim-shard-select" is hidden

    When I enter the netsim name "Fred"
    And I wait until element ".netsim-lobby-panel" is visible
    And I wait until element ".join-button" is visible
    Then element ".netsim-shard-selection-panel" is hidden
    And there is a router in the lobby

    When I press the first ".join-button" element
    And I wait until element ".netsim-send-panel" is visible
    Then element ".netsim-lobby" is hidden
    And element ".netsim-send-panel" is visible
    And element ".netsim-log-panel" is visible

    # Make sure we can navigate to another page without getting an alert
    When I disable onBeforeUnload
    And I am on "http://studio.code.org/s/20-hour/lessons/11/levels/1?noautoplay=true"

  Scenario: NetSim uses the instructions dialog
    # When the level loads, we see the instructions modal
    Given I am on the 3rd NetSim test level
    And I wait up to 5 seconds for element ".modal" to be visible
    Then element ".modal" is visible
    And element ".dialog-title" contains text "Puzzle 3 of 5"
    And element ".instructions" contains text "Transfer your favicon to a partner"

    # We can close the instructions modal
    When I close the dialog
    Then element ".modal" is not visible

    # Join a router and click the side instructions to re-open the dialog
    When I enter the netsim name "Greg"
    And I wait until element ".join-button" is visible
    And I press the first ".join-button" element
    And I wait until element "#tab_instructions" is visible
    And I press the first ".netsim-bubble" element
    Then element ".modal" is visible
