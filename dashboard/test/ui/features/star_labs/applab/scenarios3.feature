@as_student
Feature: App Lab Scenarios 3

  Background:
    Given I start a new Applab project
    And I wait for the lab page to fully load

  Scenario: App Lab Http Image
    # Create an app with an http image.
    When I ensure droplet is in text mode
    And I append text to droplet "image('test123', 'http://example.com')"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > img#test123" is visible
    And element "#divApplab > .screen > img#test123" has attribute "src" equal to "//studio.code.org/media?u=http%3A%2F%2Fexample.com"

  Scenario: App Lab Clear Puzzle and Design Mode
    # Create an app with a design mode button, then clear the puzzle.
    Given I switch to design mode
    And I drag a BUTTON into the app
    And I switch to code mode
    And Applab HTML has a button
    And I reset the puzzle to the starting version
    And I wait to see "#divApplab"
    And I wait until element "#divApplab" is visible
    And Applab HTML has no button
