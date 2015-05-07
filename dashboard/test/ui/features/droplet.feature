Feature: Droplet levels work as expected

  Background:
    Given I am on "http://learn.code.org/s/ui_tests/stage/1/puzzle/1?noautoplay=true"
    And I am a student

  # For now test only Chrome, Safari does not support actions API
  @chrome
  Scenario: Open editcode level and write some autocomplete code
    When I rotate to landscape
    And I press "show-code-header"
    And I wait to see Droplet text mode
    And I press keys "b"
    And the Droplet ACE text is "b"
    And I press keys "utto"
    And the Droplet ACE text is "butto"

    And no ACE tooltip is visible

    And I press keys ":down"

    And the Droplet ACE text is "butto"
    And there is a Droplet tooltip with text "button(buttonId, text)"

    And I press keys ":down"

    And there is a Droplet tooltip with text "radioButton"

    And I press keys ":enter"

    And the Droplet ACE text is "radioButton"

    And no ACE tooltip is visible

    And I press keys "("

    And the Droplet ACE text is "radioButton()"
