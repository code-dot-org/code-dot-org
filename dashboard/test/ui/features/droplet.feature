@dashboard_db_access
@as_student
Feature: Droplet levels work as expected
  Background:
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/5?noautoplay=true"
    And I wait for the page to fully load

  # For now test only Chrome, Safari does not support actions API
  @chrome
  Scenario: Open editcode level and write some autocompleted, tooltipped code
    When I rotate to landscape
    And I ensure droplet is in text mode
    And I press keys "b"
    And the Droplet ACE text is "b"
    And I press keys "utto"
    And the Droplet ACE text is "butto"
    And no Tooltipster tooltip is visible

    And I press keys ":down"
    And the Droplet ACE text is "butto"
    And there is a Tooltipster tooltip with text "button(id, text)"

    And I press keys ":down"
    And there is a Tooltipster tooltip with text "radioButton"

    And I press keys ":enter"
    And the Droplet ACE text is "radioButton()"
    And there is a Tooltipster tooltip with text "unique identifier"

  @no_safari_yosemite
  Scenario: Open editcode level and verify parameter autocomplete replaces quoted text
    When I rotate to landscape
    And I ensure droplet is in text mode
    And I press keys "setProperty("
    And the Droplet ACE text is "setProperty()"
    And there is a Tooltipster tooltip with text "the specified element"

    And I press double-quote key
    And the Droplet ACE text is 'setProperty("")'
    And no Tooltipster tooltip is visible

    And I press keys ":enter"
    And the Droplet ACE text is 'setProperty("screen1")'
    And no Tooltipster tooltip is visible
