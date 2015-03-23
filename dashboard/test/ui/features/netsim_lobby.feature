@no_mobile
Feature: Using the Internet Simulator Lobby

  The internet simulator lets students experiment with a simulated network environment, connecting
  to one another through our system and sending data back and forth with different encodings.

  Scenario: When not logged in, can connect to a router
    Given I load netsim
    Then element "#netsim_lobby_name" is visible
    And element "#netsim_lobby_name" is enabled
    And element "#netsim_lobby_set_name_button" is visible
    And element "#netsim_lobby_set_name_button" is enabled
    And element "#netsim_shard_select" is hidden

    When I enter the netsim name "Fred"
    Then element "#netsim_lobby_name" is disabled
    And element "#netsim_lobby_set_name_button" is hidden
    And element "#netsim_shard_select" is visible
    And element "#netsim_shard_select" contains text "My Private Network"
    And element "#shard_view" contains text "Share this private network"

    When I add a router
    Then element "#netsim_lobby_connect" is disabled

    When I select the first router
    Then element ".router-row" has class "selected-row"
    And element "#netsim_lobby_connect" is enabled

    When I press the "Connect" button
    And I wait until element ".netsim-send-panel" is visible
    Then element ".netsim-lobby" is hidden
    And element ".netsim-send-panel" is visible
    And element ".netsim-log-panel" is visible
