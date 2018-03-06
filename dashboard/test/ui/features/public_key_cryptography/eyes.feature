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

    Given I open view "Alice"
    Then I see no difference for "Alice's view"

    Given I open view "Eve"
    Then I see no difference for "Eve's view"

    Given I open view "Bob"
    Then I see no difference for "Bob's view"

    Given I open view "All"
    And I set the public modulus to 6709
    And Alice sets her private key to 2962
    Then Alice's public key is 5239
    And I see no difference for "Keys selected"

    Given Bob sets his secret number to 42
    And I calculate Bob's public number
    Then Bob's public number is 5350
    Given Alice decodes Bob's secret number
    Then Alice knows Bob's secret number is 42
    And I see no difference for "Message exchanged"

    Given Eve sets Bob's secret number to 41
    Then Eve is wrong about Bob's secret number
    And I see no difference for "Secret number not cracked"

    Given Eve sets Bob's secret number to 42
    Then Eve is right about Bob's secret number
    And I see no difference for "Secret number cracked"

    Given I click the start over button
    And I click the OK button in the dialog
    Then I see no difference for "Started over"

    And I close my eyes
