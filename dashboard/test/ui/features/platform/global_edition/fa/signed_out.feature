# We skip because the test server and drone won't localize for some reason right now
@skip
@no_mobile
Feature: Global Edition - Farsi Headers when Signed Out
  Background:
    Given Global Edition is enabled
    And I set the language cookie

  Scenario: Signed out user should see the correct header links on Dashboard
    Given I am on "http://studio.code.org/fa/users/sign_in?lang=fa-IR"
    And I dismiss the language selector
    And I select the "فارسی" option in dropdown "locale" to load a new page
    Then I wait to see ".headerlinks"
    And I see "#header-teach"
    And element "#header-teach" has "fa-IR" text from key "nav.header.teach"
    And I see "#header-about"
    And element "#header-about" has "fa-IR" text from key "nav.header.about"
    And I see "#header-csf"
    And element "#header-csf" has "fa-IR" text from key "nav.header.csf"
    And I see "#header-videos"
    And element "#header-videos" has "fa-IR" text from key "nav.header.videos"
    And I see "#header-hoa"
    And element "#header-hoa" has "fa-IR" text from key "nav.header.hour_of_ai"
