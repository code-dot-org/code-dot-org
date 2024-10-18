@no_mobile
Feature: Global Edition - Region Select

  Scenario: User can switch between the international and regional versions using the language selector on a Studio page
    Given I am on "http://studio.code.org/users/sign_in"
    And element "#locale option:checked" contains text "English"
    And element ".main h2" contains text "Have an account already? Sign in"

    When I select the "فارسی (global)" option in dropdown "locale"
    And I get redirected away from "http://studio.code.org/users/sign_in"
    Then check that I am on "http://studio.code.org/global/fa/users/sign_in?lang=fa-IR"
    And element "#locale option:checked" contains text "فارسی (global)"
    And element ".main h2" contains text "دارای حساب کاربری هستید؟ وارد سیستم شوید"

    When I select the "English" option in dropdown "locale"
    And I get redirected away from "http://studio.code.org/global/fa/users/sign_in?lang=fa-IR"
    Then check that I am on "http://studio.code.org/users/sign_in?lang=en-US"
    And element "#locale option:checked" contains text "English"
    And element ".main h2" contains text "Have an account already? Sign in"

    When I select the "فارسی" option in dropdown "locale"
    And I get redirected away from "http://studio.code.org/users/sign_in?lang=en-US"
    Then check that I am on "http://studio.code.org/users/sign_in?lang=fa-IR"
    And element "#locale option:checked" contains text "فارسی"
    And element ".main h2" contains text "دارای حساب کاربری هستید؟ وارد سیستم شوید"

  Scenario: User can switch between the international and regional versions using the language selector on a Lab page
    Given I am on "http://studio.code.org/projects/artist/new"
    And I wait for the lab page to fully load
    And element "#locale option:checked" contains text "English"
    And element ".uitest-instructionsTab" contains text "Instructions"

    When I select the "فارسی (global)" option in dropdown "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/global/fa/projects/artist/.*/edit\?lang=fa-IR"
    And element "#locale option:checked" contains text "فارسی (global)"
    And element ".uitest-instructionsTab" contains text "دستورالعمل"

    When I select the "English" option in dropdown "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=en-US"
    And element "#locale option:checked" contains text "English"
    And element ".uitest-instructionsTab" contains text "Instructions"

    When I select the "فارسی" option in dropdown "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=fa-IR"
    And element "#locale option:checked" contains text "فارسی"
    And element ".uitest-instructionsTab" contains text "دستورالعمل"
