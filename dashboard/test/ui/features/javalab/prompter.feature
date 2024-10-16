@eyes
Feature: Prompter

  @no_circle
  Scenario: Upload an image via the prompter
    When I open my eyes to test "Javalab Prompter Image Upload"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/10"
    And I wait for the lab page to fully load
    And I dismiss the teacher panel
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I see no difference for "initial page load" using stitch mode "none"
    Then I press "runButton"
    And I wait to see element with ID "photoInput"
    And I see no difference for "prompter upload view" using stitch mode "none"
    And I upload the file named "javalab_image.jpg"
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    And I see no difference for "prompter end state" using stitch mode "none"
    Then I close my eyes
