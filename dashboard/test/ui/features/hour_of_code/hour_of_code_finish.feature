Feature: After completing the Hour of Code, the player is directed to a congratulations page

Background:
  Given I am on "http://studio.code.org/s/mc/reset"

Scenario: Completing Minecraft HoC should go to certificate page and generate a certificate
  Given I load the last Minecraft HoC level
  Then I wait until the Minecraft game is loaded
  And I press "runButton"
  Then I wait until element "#rightButton" is visible
  And I press "rightButton"
  Then I wait to see a congrats dialog with title containing "Keep Playing"
  And I press "#continue-button" using jQuery
  And I wait until current URL contains "/congrats"
  And my query params match "\?i\=.*\&s\=bWM\="
  And I wait to see element with ID "congrats-container"
  And I wait to see element with ID "uitest-certificate"
  And I type "Robo Coder" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
