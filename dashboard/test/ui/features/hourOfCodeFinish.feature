Feature: After completing the Hour of Code, the player is directed to a congratulations page

Background:
  Given I am on "http://studio.code.org/s/mc/reset"

Scenario: Completing Minecraft HoC should go to certificate page and generate a certificate
  Given I am on "http://studio.code.org/s/mc/stage/1/puzzle/14?noautoplay=true&customSlowMotion=0.1"
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible
  Then I wait until the Minecraft game is loaded
  And I press "runButton"
  Then I wait until element "#rightButton" is visible
  And I press "rightButton"
  Then I wait to see a congrats dialog with title containing "Keep Playing"
  And I press "#continue-button" using jQuery
  And I wait to see element with ID "hoc-certificate-small"
  And I get redirected to "/congrats" via "dashboard"
  And my query params match "\?i\=.*\&s\=bWM\="
  Then I print the HTML contents of element "hoc-certificate-small"
  And I wait to see an image "MC_Hour_Of_Code_Certificate.png"
  And I type "Robo Coder" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see an image "/api/hour/certificate/"
