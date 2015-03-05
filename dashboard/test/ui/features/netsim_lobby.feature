@no_mobile
Feature: Using the Internet Simulator Lobby

  The internet simulator lets students experiment with a simulated network environment, connecting
  to one another through our system and sending data back and forth with different encodings.

  Scenario: If I am not logged in, I must enter a name
    Given I am not signed in
    And I load netsim
    Then element "#netsim_lobby_name" is visible
    And element "#netsim_lobby_name" is enabled
    And element "#netsim_lobby_set_name_button" is visible
    And element "#netsim_lobby_set_name_button" is enabled
    And element "#netsim_shard_select" is hidden

  Scenario: Entering a name displays the shard view
    Given I am not signed in
    And I load netsim
    And I enter the netsim name "Fred"
    Then element "#netsim_lobby_name" is disabled
    And element "#netsim_lobby_set_name_button" is hidden
    And element "#netsim_shard_select" is visible

  Scenario: If I am not logged in, a private shard is used
    Given I am not signed in
    And I load netsim
    When I enter the netsim name "Wilma"
    Then element "#netsim_shard_select" contains text "My Private Network"
    And element "#shard_view" contains text "Share this private network"

  Scenario: If I am logged in, my name is filled in automatically
    Given I am a teacher
    And I load netsim
    Then element "#netsim_lobby_name" is disabled
    And element "#netsim_lobby_set_name_button" is hidden
    And element "#netsim_shard_select" is visible

  Scenario: I can add a router to the shard
    Given I am not signed in
    And I load netsim
    And I enter the netsim name "Pebbles"
    When I add a router
    Then element ".router_row" contains text "Router"

  Scenario: The connect button enables when a router is selected
    Given I am not signed in
    And I load netsim
    And I enter the netsim name "Barney"
    When I add a router
    Then element ".router_row" does not have class "selected_row"
    And element "#netsim_lobby_connect" is disabled
    When I select the first router
    Then element ".router_row" has class "selected_row"
    And element "#netsim_lobby_connect" is enabled

  Scenario: Connecting to a router hides the lobby, and shows the send controls
    Given I am not signed in
    And I load netsim
    And I enter the netsim name "Betty"
    And I add a router
    And I connect to the first router
    Then element ".netsim_lobby" is hidden
    And element ".netsim_send_panel" is visible
    And element ".netsim_log_panel" is visible
