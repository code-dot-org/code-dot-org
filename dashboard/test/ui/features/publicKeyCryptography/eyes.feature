@eyes
Feature: Public Key Cryptography Eyes

  Scenario: Modulo Clock Appearance
    Given I am on the 1st Public Key Cryptography test level
    When I open my eyes to test "Modulo Clock Appearance"
    Then I see no difference for "initial load"

    Given I set the modulo clock speed to 9
    And I set the clock size to 50
    And I set the dividend to 531
    When I run the modulo clock
    And I wait for 5 seconds
    Then I see no difference for "completed run"

    And I close my eyes

  Scenario: Cryptography Widget Appearance
    Given I am on the 2nd Public Key Cryptography test level
    When I open my eyes to test "Cryptography Widget Appearance"
    Then I see no difference for "initial load"
    And I close my eyes
