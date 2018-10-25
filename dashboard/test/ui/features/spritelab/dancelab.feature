Feature: Dance Lab
  Scenario: Song selector is visible
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    And element "#song_selector" is visible

  # This test requires cloudfront.
  @no_circle
  Scenario: Restricted audio content is protected
    When I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does not contain "placeholder for testing"

    When I am on "http://studio.code.org/dashboardapi/sign_cookies"
    And I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does contain "placeholder for testing"
