@no_mobile
Feature: Global Edition - Region Select

  Scenario: User can switch between the international and regional versions using the language selector on a Studio page
    Given I am on "http://studio.code.org/incubator"
    And element "#locale option:checked" contains text "English"
    And element "#header-incubator" contains text "Incubator"

    When I select the "فارسی (global)" option in dropdown "locale"
    And I get redirected away from "http://studio.code.org/incubator"
    Then check that I am on "http://studio.code.org/global/fa/incubator?lang=fa-IR"
    And element "#locale option:checked" contains text "فارسی (global)"
    And element "#header-incubator" contains text "کارگاه"

    When I select the "English" option in dropdown "locale"
    And I get redirected away from "http://studio.code.org/global/fa/incubator?lang=fa-IR"
    Then check that I am on "http://studio.code.org/incubator?lang=en-US"
    And element "#locale option:checked" contains text "English"
    And element "#header-incubator" contains text "Incubator"

    When I select the "فارسی" option in dropdown "locale"
    And I get redirected away from "http://studio.code.org/incubator?lang=en-US"
    Then check that I am on "http://studio.code.org/incubator?lang=fa-IR"
    And element "#locale option:checked" contains text "فارسی"
    And element "#header-incubator" contains text "کارگاه"

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
