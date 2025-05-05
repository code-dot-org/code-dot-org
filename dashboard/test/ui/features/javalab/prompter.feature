@eyes
Feature: Prompter

  @no_ci
  Scenario: Upload an image via the prompter
    When I open my eyes to test "Javalab Prompter Image Upload"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/10"
    And I wait for the lab page to fully load
    And I dismiss the teacher panel
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I see no difference for "initial page load" in the current viewport
    Then I press "runButton"
    And I wait to see element with ID "photoInput"
    And I see no difference for "prompter upload view" in the current viewport
    And I upload the file named "javalab_image.jpg"
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    And I see no difference for "prompter end state" in the current viewport
    Then I close my eyes
