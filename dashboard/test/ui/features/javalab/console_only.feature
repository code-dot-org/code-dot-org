@eyes
Feature: Console only level

  @no_circle
  Scenario: Console only level responds to text input from user
    When I open my eyes to test "Javalab Console Only Level"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2"
    And I wait for the lab page to fully load
    And I dismiss the teacher panel
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I see no difference for "initial page load" using stitch mode "none"

    # Interact with program that asks your name
    Then I press "runButton"
    And I wait until element ".javalab-console" contains text "What's your name?"
    And I type "Harry" into "#console-input"
    And I press enter key
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    And I see no difference for "program completed" using stitch mode "none"
    Then I close my eyes
