Feature: Make sure we can see the finish button for craft levels on small screens

  Background:
    Given I create an authorized teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally" and go home

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: can see finish button on "Minecraft Adventurer"
    And I check that the minecraft free play level for "Minecraft Adventurer" shows the finish button for mobile screens
