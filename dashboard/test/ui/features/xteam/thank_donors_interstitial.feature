Feature: Thank Donors Interstitial

  @no_mobile
  Scenario: New student sign in from code.org
    Given I create a new student named "Beth" and go home
    Then I wait to see "#thank-donors-modal"
    And I click "#dismiss-thank-donors"
    And I wait until element "#thank-donors-modal" is not visible

  @no_mobile
  Scenario: New teacher sign in from code.org
    Given I create a new teacher named "Alice" and go home
    Then I wait to see "#thank-donors-modal"
    And I click "#dismiss-thank-donors"
    And I wait until element "#thank-donors-modal" is not visible

  @only_mobile
  Scenario: New student sign in from code.org does not show donor interstitial on mobile'
    Given I create a new student named "Bob" and go home
    Then element "#thank-donors-modal" is not visible

  @eyes
  Scenario: Thank Donors Interstitial
    Given I create a new student named "Beth" and go home
    When I open my eyes to test "Thank Donors Interstitial Shown And Dismissed"
    Then I wait to see "#thank-donors-modal"
    And I see no difference for "thank donors interstitial"

    When I click "#thank-donors-modal"
    Then I wait until element "#thank-donors-modal" is not visible
    And I see no difference for "thank donors interstitial closed"
    And I close my eyes
