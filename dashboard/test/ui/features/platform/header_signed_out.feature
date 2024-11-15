@no_mobile
@single_session
Feature: Header navigation bar - Signed out
  Scenario: Signed out user in English should see 7 header links
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I wait to see "#headerlinks"
    And I see "#header-learn"
    And element "#header-learn" contains text "Learn"
    And I see "#header-teach"
    And element "#header-teach" contains text "Teach"
    And I see "#header-districts"
    And element "#header-districts" contains text "Districts"
    And I see "#header-stats"
    And element "#header-stats" contains text "Stats"
    And I see "#header-help"
    And element "#header-help" contains text "Help Us"
    And I see "#header-about"
    And element "#header-about" contains text "About"
    And I see "#header-incubator"
    And element "#header-incubator" contains text "Incubator"

  Scenario: Signed out user in English should see 3 header links on small desktop
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I change the browser window size to 1268 by 768
    And I wait to see "#headerlinks"
    And I see "#header-learn"
    And element "#header-learn" contains text "Learn"
    And I see "#header-teach"
    And element "#header-teach" contains text "Teach"
    And I see "#header-districts"
    And element "#header-districts" contains text "Districts"
    And element "#header-stats" is not visible
    And element "#header-help" is not visible
    And element "#header-about" is not visible
    And element "#header-incubator" is not visible
    Then I maximize the browser window

  Scenario: Signed out user in Spanish should see 7 header links
    Given I am on "http://code.org/lang/es"
    Then check that I am on "http://code.org/"
    And I dismiss the language selector
    Given I am on "http://studio.code.org/home"
    And I wait to see ".headerlinks"
    And I see "#header-learn"
    And element "#header-learn" has "es" text from key "nav.header.learn"
    And I see "#header-teach"
    And element "#header-teach" has "es" text from key "nav.header.teach"
    And I see "#header-districts"
    And element "#header-districts" has "es" text from key "nav.header.districts"
    And I see "#header-stats"
    And element "#header-stats" has "es" text from key "nav.header.stats"
    And I see "#header-help"
    And element "#header-help" has "es" text from key "nav.header.help_us"
    And I see "#header-incubator"
    And element "#header-incubator" has "es" text from key "nav.header.incubator"
    And I see "#header-about"
    And element "#header-about" has "es" text from key "nav.header.about"

  @chrome
  Scenario: Signed out user can click on the header links
    Given I am on "http://code.org"
    And I set the language cookie
    And I set the cookie named "_loc_notice" to "1"

    Then I reload the page
    And I wait to see "#headerlinks"

    # We click on each header link and see where we go
    And I press "header-learn" to load a new page
    Then check that I am on "http://code.org/students"
    And I press "header-teach" to load a new page
    Then check that I am on "http://code.org/teach"
    And I press "header-districts" to load a new page
    Then check that I am on "http://code.org/administrators"
    And I press "header-stats" to load a new page
    Then check that I am on "http://code.org/promote"
    And I press "header-help" to load a new page
    Then check that I am on "http://code.org/help"
    And I press "header-incubator" to load a new page
    Then check that I am on "http://studio.code.org/incubator"
    And I press "header-about" to load a new page
    Then check that I am on "http://code.org/about"
