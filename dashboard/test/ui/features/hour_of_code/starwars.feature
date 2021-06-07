@single_session
Feature: Hour of Code 2015 tutorial is completable

  @no_ie @no_mobile
  Scenario: Solving puzzle 1 in block mode
    Given I am on "http://studio.code.org/s/starwars/reset"
    And execute JavaScript expression "window.localStorage.clear()"
    And I am on "http://studio.code.org/s/starwars/lessons/1/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    When I drag droplet block "moveRight" to line 2
    And I press "runButton"
    And I wait to see ".modal"
    Then element "#continue-button" is visible
    When I close the dialog
    Then I wait until I am on "http://studio.code.org/s/starwars/lessons/1/levels/2"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "perfect" for level 1

  Scenario: Solving puzzle 1 in text mode
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/1?noautoplay=true"
    And I rotate to landscape
    Then I wait for the page to fully load
    When I ensure droplet is in text mode
    And I append text to droplet "moveRight();\n"
    And I press "runButton"
    And I wait to see ".modal"
    Then element "#continue-button" is visible
    When I close the dialog
    Then I wait until I am on "http://studio.code.org/s/starwars/lessons/1/levels/2"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "perfect" for level 1

  Scenario: Solving puzzle 2 in text mode
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/2?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    When I ensure droplet is in text mode
    And I append text to droplet "moveRight();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveDown();\n"
    And I press "runButton"
    And I wait to see ".modal"
    Then element "#continue-button" is visible

  Scenario: Solving puzzle 3 in text mode
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/3?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    When I ensure droplet is in text mode
    And I append text to droplet "moveUp();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveRight();\n"
    And I press "runButton"
    And I wait to see ".modal"
    Then element "#continue-button" is visible

  # Puzzle 4 starts with a video, but we skip it with ?noautoplay=true
  # Puzzle 4 starts in text mode, so no need to switch to text mode
  Scenario: Solving puzzle 4 in text mode
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/4?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    When I append text to droplet "moveLeft();\n"
    And I append text to droplet "moveLeft();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveLeft();\n"
    And I press "runButton"
    And I wait to see ".modal"
    Then element "#continue-button" is visible

  Scenario: Solving puzzle 5 in text mode
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/5?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I append text to droplet "moveRight();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveLeft();\n"
    And I press "runButton"
    And I wait to see ".modal"
    Then element "#continue-button" is visible

  Scenario: Solving puzzle 6 in text mode
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/6?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    When I ensure droplet is in text mode
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveUp();\n"
    And I append text to droplet "moveRight();\n"
    And I append text to droplet "moveRight();\n"
    And I append text to droplet "moveUp();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveRight();\n"
    And I press "runButton"
    And I wait to see ".modal"
    Then element "#continue-button" is visible

  # This scenario writes a program that -would- successfully finish the level
  # if there wasn't a hazard in the way.  It tries to ensure that we actually
  # stop execution when a hazard is touched.
  Scenario: Failing puzzle 5 by touching hazard
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/5?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I append text to droplet "moveLeft();\n"
    And I append text to droplet "moveLeft();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveDown();\n"
    And I append text to droplet "moveRight();\n"
    And I append text to droplet "moveRight();\n"
    And I append text to droplet "moveRight();\n"
    And I append text to droplet "moveUp();\n"
    And I append text to droplet "moveUp();\n"
    And I append text to droplet "moveUp();\n"
    And I press "runButton"
    Then element ".modal" is not visible
    And element "#continue-button" is not visible

  @no_ie @no_mobile
  Scenario: Using the "Start Over" button in block mode
    Given I am on "http://studio.code.org/s/starwars/reset"
    And execute JavaScript expression "window.localStorage.clear()"
    And I am on "http://studio.code.org/s/starwars/lessons/1/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    When I drag droplet block "moveUp" to line 2
    And I drag droplet block "moveLeft" to line 3
    And I drag droplet block "moveDown" to line 4
    And I press "clear-puzzle-header"
    And I press "confirm-button"
    Then the Droplet ACE text is "moveRight();\n"

  Scenario: Using the "Start Over" button in text mode
    Given I am on "http://studio.code.org/s/starwars/reset"
    And execute JavaScript expression "window.localStorage.clear()"
    And I am on "http://studio.code.org/s/starwars/lessons/1/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    When I ensure droplet is in text mode
    And I append text to droplet "moveUp();\n"
    And I append text to droplet "moveLeft();\n"
    And I append text to droplet "moveDown();\n"
    And I press "clear-puzzle-header"
    And I press "confirm-button"
    Then the Droplet ACE text is "moveRight();\n"
