@as_student
Feature: Race Interstitial

  @eyes
  Scenario: Race Interstitial Shown And Dismissed
    Given I am on "http://studio.code.org/home?forceRaceInterstitial=true"
    When I open my eyes to test "Race Interstitial Shown And Dismissed"
    And I wait to see "#race-modal"
    Then I see no difference for "race interstitial"

    When I press "later-link"
    And I wait until element "#race-modal" is not visible
    Then I see no difference for "race interstitial closed"
    Then I close my eyes
