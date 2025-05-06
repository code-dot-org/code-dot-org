Feature: Visiting a studio page

Scenario: Resizing Sprites
  Given I am on "http://studio.code.org/s/allthethings/lessons/22/levels/1?noautoplay=true"
  And I wait for the lab page to fully load

  Then the 0th sprite image has height "100"
  And the 15th sprite image has height "100"

  When I press "runButton"
  Then I wait to see a ".congrats"
  And I press "again-button"
  Then the 0th sprite image has height "50"
  And the 15th sprite image has height "150"
