@no_mobile
Feature: Using the Internet Simulator Lobby

  The internet simulator lets students experiment with a simulated network environment, connecting
  to one another through our system and sending data back and forth with different encodings.

  Scenario: When not logged in, can connect to a router
    Given I load netsim
    Then element "#netsim-lobby-name" is visible
    And element "#netsim-lobby-name" is enabled
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
