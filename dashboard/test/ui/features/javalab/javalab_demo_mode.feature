@eyes
@no_mobile
@no_circle
Feature: Javalab Demo Mode

  # Note this only tests showing a captcha to unverified teachers
  # (rather than the full flow of submitting a captcha and seeing code executed),
  # as we cannot solve the captcha with automated test software.
  Scenario: Present captcha challenge
    When I open my eyes to test "Javalab Demo Mode"
    Given I create a teacher named "Ms_Frizzle"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/4"
    And I wait for the lab page to fully load
    And I dismiss the teacher panel
    When I press "runButton"
    And I wait to see a modal containing text "Please confirm you're human"
    And I switch to the first iframe once it exists
    And I wait to see ".recaptcha-checkbox"
    Then I see no difference for "initial modal view" using stitch mode "none"
    Then I close my eyes
