@as_student
Feature: App Lab Scenarios 5

  Background:
    Given I start a new Applab project
    And I wait for the lab page to fully load

  Scenario: Can read and set button text
    Given I ensure droplet is in text mode
    And I append text to droplet "button('testButton1', 'Peanut Butter');\n"
    And I append text to droplet "button('testButton2', 'Jelly');\n"
    And I append text to droplet "setText('testButton1', getText('testButton2'));\n"
    When I press "runButton"
    And I wait until element "#divApplab > .screen > button#testButton2" is visible
    Then element "#testButton1" contains text "Jelly"
    Then element "#testButton2" contains text "Jelly"
