@eyes
@no_mobile
@no_circle
Feature: Javalab Demo Mode

  Scenario: Solve captcha challenge
    When I open my eyes to test "Javalab Demo Mode"
    Given I create a teacher named "Ms_Frizzle"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/4"
    And I wait for the page to fully load
    And I dismiss the teacher panel
    When I press "runButton"
    And I wait to see a modal containing text "Please confirm you're human"
    And I switch to the first iframe once it exists
    And I wait to see ".recaptcha-checkbox"
    Then I see no difference for "initial modal view" using stitch mode "none"
    When I click ".recaptcha-checkbox"
    And I switch to the default content
    And I wait until "#uitest-recaptcha-submit" is not disabled
    Then I see no difference for "captcha submitted" using stitch mode "none"
    When I click selector "#uitest-recaptcha-submit"
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    Then I close my eyes
