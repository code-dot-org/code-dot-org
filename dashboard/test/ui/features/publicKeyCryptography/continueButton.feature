Feature: Public Key Cryptography - Continue Button

  # We had a regression in the continue button for this widget during some refactoring
  # of the more complex continue behavior for other apps.  Make sure it doesn't happen
  # again. -Brad
  Scenario: Clicking the continue button
    Given I am on the 1st Public Key Cryptography test level
    When I press the last button with text "Continue"
    And I wait to see ".panel-alice"
    Then check that I am on "http://studio.code.org/s/allthethings/stage/31/puzzle/2"
