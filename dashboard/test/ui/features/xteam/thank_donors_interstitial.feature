Feature: Thank Donors Interstitial

  @no_phone
  Scenario: New student sign in from code.org
    Given I delete the cookie named "has_seen_thank_donors"
    Then I create a student who has never signed in named "Beth" and go home
    Then I wait to see "#thank-donors-modal"
    And I click "#dismiss-thank-donors"
    And I wait until element "#thank-donors-modal" is not visible

  @no_phone
  Scenario: New teacher sign in from code.org
    Given I delete the cookie named "has_seen_thank_donors"
    Then I create a teacher who has never signed in named "Alice" and go home
    Then I wait to see "#thank-donors-modal"
    And I click "#dismiss-thank-donors"
    And I wait until element "#thank-donors-modal" is not visible

  @only_phone
  Scenario: New student sign in from code.org does not show donor interstitial on mobile
    Given I delete the cookie named "has_seen_thank_donors"
    Then I create a student who has never signed in named "Bob" and go home
    Then element "#thank-donors-modal" is not visible

  @eyes
  Scenario: Thank Donors Interstitial
    Given I delete the cookie named "has_seen_thank_donors"
    Then I create a student who has never signed in named "Beth" and go home
    When I open my eyes to test "Thank Donors Interstitial Shown And Dismissed"
    Then I wait to see "#thank-donors-modal"
    And I see no difference for "thank donors interstitial"

    When I click "#dismiss-thank-donors"
    Then I wait until element "#thank-donors-modal" is not visible
    And I see no difference for "thank donors interstitial closed"
    And I close my eyes
