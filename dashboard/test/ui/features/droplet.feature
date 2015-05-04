Feature: Droplet levels work as expected

  Background:
    Given I am on "http://learn.code.org/s/ui_tests/stage/1/puzzle/1?noautoplay=true"

  # For now test only Chrome, Safari does not support keyboard actions API
  @chrome
  Scenario: Open editcode level and write some autocomplete code
    When I rotate to landscape
    And I press "show-code-header"
    And I wait to see Droplet text mode
    And I press keys "b"
    And the Droplet ACE text is "b"
    And I press keys "utto"
    And the Droplet ACE text is "butto"

    # TODO(bjordan): Assert: no tooltip, just dropdown

    And I press keys ":down"
    And the Droplet ACE text is "butto"

    # TODO(bjordan): Assert: see tooltip for button

    And I press keys ":enter"
    And the Droplet ACE text is "button"

    # TODO(bjordan): Assert: Original tooltip is hidden

    And I press keys "("
    And the Droplet ACE text is "button()"
