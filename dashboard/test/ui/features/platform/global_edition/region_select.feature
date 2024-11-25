@no_mobile
Feature: Global Edition - Region Select

  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  Scenario: User can switch between the international and regional versions using the language selector on a Pegasus page
    Given I am on "http://code.org"
    And element "#selectLanguage option:contains(English)" is checked
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element "#pagefooter #global-edition-region-reset" does not exist

    When I select the "فارسی" option in dropdown with class "language-dropdown select" to load a new page
    Then I get redirected away from "http://code.org"
    And check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element ".language-dropdown:visible" has escaped text "\n\n\n\nEnglish\nفارسی\n\n\n\n"
    And element "#pagefooter #global-edition-region-reset" is visible

    When I am on "http://code.org"
    Then I get redirected away from "http://code.org"
    And check that I am on "http://code.org/global/fa"

    When I select the "English" option in dropdown with class "language-dropdown select" to load a new page
    Then I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element ".language-dropdown:visible" has escaped text "\n\n\n\nEnglish\nفارسی\n\n\n\n"
    And element "#pagefooter #global-edition-region-reset" is visible

    When I select the "فارسی" option in dropdown with class "language-dropdown select" to load a new page
    And I click selector "#pagefooter #global-edition-region-reset:contains(Return to Full Site)" once I see it to load a new page
    Then I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/"
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element "#pagefooter #global-edition-region-reset" does not exist

  Scenario: User can switch between the international and regional versions using the language selector on a Studio page
    Given I am on "http://studio.code.org/users/sign_in"
    And element "#locale option:contains(English)" is checked

    When I select the "فارسی" option in dropdown "locale" to load a new page
    And I get redirected away from "http://studio.code.org/users/sign_in"
    Then check that I am on "http://studio.code.org/global/fa/users/sign_in?lang=fa-IR"
    And element "#locale option:contains(فارسی)" is checked

    When I am on "http://studio.code.org"
    Then I get redirected away from "http://studio.code.org/users/sign_in"
    And check that I am on "http://studio.code.org/global/fa/users/sign_in"

    When I select the "English" option in dropdown "locale" to load a new page
    Then I get redirected away from "http://studio.code.org/global/fa/users/sign_in"
    And check that I am on "http://studio.code.org/users/sign_in?lang=en-US"
    And element "#locale option:contains(English)" is checked

  Scenario: User can switch between the international and regional versions using the language selector on a Lab page
    Given I am on "http://studio.code.org/projects/artist/new"
    And I wait for the lab page to fully load
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:checked" contains text "English"

    When I select the "فارسی" option in dropdown named "locale" to load a new page
    And I wait for the lab page to fully load
    Then check that the URL matches "/global/fa/projects/artist/.*/edit\?lang=fa-IR"
    And I wait until element ".uitest-instructionsTab" contains text "دستورالعمل"
    And element "#localeForm option:contains(فارسی)" is checked

    When I select the "English" option in dropdown named "locale" to load a new page
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=en-US"
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:contains(English)" is checked

  Scenario: Users can switch between Global Edition Region languages using the header links on a Pegasus page
    Given I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element "#ge-region-languages" is visible
    And element "#ge-region-languages" has escaped text "\n\n\n\n\nView in English\n\n\n\n"

    When I click selector "#ge-region-languages a:contains(View in English)" to load a new page
    Then I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element "#ge-region-languages" is visible
    And element "#ge-region-languages" has escaped text "\n\n\n\n\nView in فارسی\n\n\n\n"

    When I click selector "#ge-region-languages a:contains(View in فارسی)" to load a new page
    Then I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element "#ge-region-languages" is visible
    And element "#ge-region-languages" has escaped text "\n\n\n\n\nView in English\n\n\n\n"
