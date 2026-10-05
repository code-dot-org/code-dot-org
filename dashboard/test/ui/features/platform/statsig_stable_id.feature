@chrome
@no_mobile
Feature: Statsig stable ID
  Scenario: The stable ID persists through consent changes and cookie recovery
    Given I am on "http://studio.code.org/api/statsig/stable_id"
    Then I remember the generated Statsig stable ID
    And the Statsig stable ID cookie is not set

    When I am on "http://studio.code.org/api/statsig/stable_id"
    Then the Statsig stable ID response matches the expected UUID
    And the Statsig stable ID cookie is not set

    When I am on "http://studio.code.org/users/sign_in?otreset=true&otgeo=es"
    And I wait until current URL contains "otreset=false"
    And I wait until element "#onetrust-pc-btn-handler" is visible
    And I press "onetrust-pc-btn-handler"
    And I wait until element "#onetrust-pc-sdk" is visible
    And I set performance cookie consent to "disabled"
    And I click ".save-preference-btn-handler"
    And I wait until element "#onetrust-banner-sdk" is not visible
    And I reload the page
    Then performance cookies are disabled
    And the Statsig stable ID cookie is not set

    When I am on "http://studio.code.org/users/sign_in?otreset=true&otgeo=es"
    And I wait until current URL contains "otreset=false"
    And I wait until element "#onetrust-pc-btn-handler" is visible
    And I press "onetrust-pc-btn-handler"
    And I wait until element "#onetrust-pc-sdk" is visible
    And I set performance cookie consent to "enabled"
    And I click ".save-preference-btn-handler"
    And I wait until element "#onetrust-banner-sdk" is not visible
    And I reload the page
    Then performance cookies are enabled
    And the Statsig stable ID cookie matches the API response

    When I delete the cookie named "statsig_stable_id"
    Then the Statsig stable ID cookie is not set
    When I reload the page
    Then performance cookies are enabled
    And the Statsig stable ID cookie matches the API response

    When I set the cookie named "statsig_stable_id" to "8f819c93-3aa9-4c2f-9bea-8d32a448f368"
    Then the Statsig stable ID cookie is a different UUID from the API response
    When I am on "http://studio.code.org/api/statsig/stable_id"
    Then the Statsig stable ID response is "8f819c93-3aa9-4c2f-9bea-8d32a448f368"
    And I remember the generated Statsig stable ID
    When I am on "http://studio.code.org/users/sign_in"
    Then the Statsig stable ID cookie matches the API response

  Scenario: The stable ID persists through sign-in and changes after sign-out
    Given I create a student named "Student1"
    And I create a student named "Student2"
    And I sign out
    When I am on "http://studio.code.org/api/statsig/stable_id"
    Then I remember the generated Statsig stable ID
    And the Statsig stable ID cookie is not set

    When I am on "http://studio.code.org/users/sign_in?otreset=true&otgeo=es"
    And I wait until current URL contains "otreset=false"
    And I wait until element "#onetrust-pc-btn-handler" is visible
    And I press "onetrust-pc-btn-handler"
    And I wait until element "#onetrust-pc-sdk" is visible
    And I click "label[for='ot-group-id-C0002']"
    And I wait until "#ot-group-id-C0002" is checked
    And I click ".save-preference-btn-handler"
    And I wait until element "#onetrust-banner-sdk" is not visible
    And I reload the page
    Then the Statsig stable ID cookie matches the API response

    When I wait to see "#signin"
    And I fill in username and password for "Student1"
    And I click "#signin-button" to load a new page
    Then I wait until I am on "http://studio.code.org/home"
    And I wait until element ".display_name" is visible
    And element ".display_name" contains text "Student1"
    And the Statsig stable ID cookie matches the API response

    When I sign out
    Then the Statsig stable ID cookie is not set

    When I am on "http://studio.code.org/users/sign_in"
    And I wait to see "#signin"
    And I fill in username and password for "Student2"
    And I click "#signin-button" to load a new page
    Then I wait until I am on "http://studio.code.org/home"
    And I wait until element ".display_name" is visible
    And element ".display_name" contains text "Student2"
    And the Statsig stable ID cookie is a different UUID from the API response
