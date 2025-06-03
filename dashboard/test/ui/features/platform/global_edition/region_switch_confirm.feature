@no_mobile
@chrome
@pegasus_content
Feature: Global Edition - Region Switch Confirm Modal

  Background:
    Given I am on "http://studio.code.org"
    And I clear session storage
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"
    And I use a cookie to mock the DCDO key "global_edition_region_switch_confirm_enabled_in" as "["fa"]"

  Scenario: The modal is shown on studio.code.org (Studio) domain
    Given I am on "http://studio.code.org"
    And I am in Iran
    And I reload the page
    Then I wait until element "#global-edition-region-switch-confirm.fade.in[role='dialog']" is visible

  Scenario: The modal is not shown on hourofcode.com domain
    Given I am on "http://hourofcode.com/us"
    And I am in Iran
    And I reload the page
    Then element "#global-edition-region-switch-confirm" is not visible
