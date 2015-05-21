@dashboard_db_access
Feature: Droplet levels work as expected
  Background:
    Given I am on "http://learn.code.org/"
    And I am a student
    And I am on "http://learn.code.org/users/sign_in"
    And I am on "http://learn.code.org/s/ui_tests/stage/1/puzzle/1?noautoplay=true"

  # For now test only Chrome, Safari does not support actions API
  @chrome
  Scenario: Open editcode level and write some autocompleted, tooltipped code
    When I rotate to landscape
    And I press "show-code-header"
    And I wait to see Droplet text mode
    And I press keys "b"
    And the Droplet ACE text is "b"
    And I press keys "utto"
    And the Droplet ACE text is "butto"

    And no Tooltipster tooltip is visible

    And I press keys ":down"

    And the Droplet ACE text is "butto"
    And there is a Tooltipster tooltip with text "button(buttonId, text)"

    And I press keys ":down"

    And there is a Tooltipster tooltip with text "radioButton"

    And I press keys ":enter"

    And the Droplet ACE text is "radioButton"

    And no Tooltipster tooltip is visible

    And I press keys "("

    And the Droplet ACE text is "radioButton()"

    And there is a Tooltipster tooltip with text "unique identifier"
