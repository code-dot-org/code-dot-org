@no_mobile
Feature: Global Edition - Region Select

  Background:
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  Scenario: User can switch between the international and regional versions using the language selector on a Studio page
    Given I am on "http://studio.code.org/users/sign_in"
    And element "#locale option:contains(English)" is checked

    When I select the "فارسی" option in dropdown "locale" to load a new page
    Then I get redirected away from "http://studio.code.org"
    And check that I am on "http://studio.code.org/fa/users/sign_in?lang=fa-IR"
    And element "#locale option:contains(فارسی)" is checked

    When I am on "http://studio.code.org"
    Then I get redirected away from "http://studio.code.org"
    And check that I am on "http://studio.code.org/fa/users/sign_in"

    When I select the "English" option in dropdown "locale" to load a new page
    Then I get redirected away from "http://studio.code.org/fa/users/sign_in"
    And check that I am on "http://studio.code.org/users/sign_in?lang=en-US"
    And element "#locale option:contains(English)" is checked

  Scenario: User can switch to regional versions using the language selector on a Lab page
    Given I am on "http://studio.code.org/projects/artist/new"
    And I wait for the lab page to fully load
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:checked" contains text "English"

    When I select the "فارسی" option in dropdown named "locale" to load a new page
    And I wait for the lab page to fully load
    Then check that the URL matches "/fa/projects/artist/.*/edit\?lang=fa-IR"
    And I wait until element ".uitest-instructionsTab" contains text "دستورالعمل"
    And element "#localeForm option:contains(فارسی)" is checked

    When I select the "English" option in dropdown named "locale" to load a new page
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=en-US"
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:contains(English)" is checked
