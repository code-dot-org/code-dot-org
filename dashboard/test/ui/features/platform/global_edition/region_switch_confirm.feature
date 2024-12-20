@no_mobile
@chrome
Feature: Global Edition - Region Switch Confirm Modal

  Background:
    Given I am on "http://code.org"
    And I clear session storage
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"
    And I use a cookie to mock the DCDO key "global_edition_region_switch_confirm_enabled_in" as "["fa"]"

  Scenario: An user from Iran interacts with the modal that proposes them to switch to the Farsi version of Code.org
    Given I am on "http://code.org"
    And I am in Iran
    And I reload the page

    When I wait until element "#global-edition-region-switch-confirm.fade.in[role='dialog']" is visible
    Then element "#global-edition-region-switch-confirm h1" has text "Hello!"
    And element "#global-edition-region-switch-confirm p" has text "Would you like to see the Farsi version of Code.org?"
    And element "#global-edition-region-switch-confirm button#global-edition-region-switch-confirm-accept" has text "Yes, take me to the Farsi site"
    And element "#global-edition-region-switch-confirm a#global-edition-region-switch-confirm-reject" has text "No thanks, take me to Code.org"

    # User sees the modal only once
    When I press "ui-close-dialog"
    And I wait until element "#global-edition-region-switch-confirm" is not visible
    Then I reload the page
    And element "#global-edition-region-switch-confirm" is not visible

    # User rejects the switch to the regional version and stays on the current page
    Given I clear local storage
    And I reload the page
    And I wait until element "#global-edition-region-switch-confirm.fade.in[role='dialog']" is visible
    When I press "global-edition-region-switch-confirm-reject"
    Then I wait until element "#global-edition-region-switch-confirm" is not visible
    And check that I am on "http://code.org/#"

    # User accepts the switch to the regional version and gets redirected to it
    Given I clear local storage
    And I am on "http://code.org"
    And I wait until element "#global-edition-region-switch-confirm.fade.in[role='dialog']" is visible
    When I press "global-edition-region-switch-confirm-accept"
    Then I get redirected away from "http://code.org"
    And I wait until I am on "http://code.org/global/fa"
    And element "#global-edition-region-switch-confirm" is not visible

  Scenario: The modal is shown on studio.code.org (Studio) domain
    Given I am on "http://studio.code.org"
    And I am in Iran
    And I reload the page
    Then I wait until element "#global-edition-region-switch-confirm.fade.in[role='dialog']" is visible

  Scenario: The modal is not shown to users from the US
    Given I am on "http://code.org"
    Then I wait until element "#global-edition-region-switch-confirm" is not visible

  Scenario: The modal is not shown on hourofcode.com domain
    Given I am on "http://hourofcode.com/us"
    And I am in Iran
    And I reload the page
    Then element "#global-edition-region-switch-confirm" is not visible
