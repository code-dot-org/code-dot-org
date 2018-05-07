@eyes
Feature: Cookie banner on various sites

Scenario Outline: Show cookie banner, dismiss it and confirm it's dismissed
  When I open my eyes to test "<test_name>"
  And I am on "<url>?show_cookie_banner_on_test"
  And I dismiss the language selector
  And I rotate to landscape
  And I wait to see "#accept-cookies"
  Then I see no difference for "initial load with cookie banner"

  And I press "accept-cookies"
  Then I wait until element "#accept-cookies" is not visible

  Then I reload the page
  Then I am on "<url>?show_cookie_banner_on_test"
  And I wait until element "#accept-cookies" is not visible

  Then I close my eyes

Examples:
  | url                                                               | test_name                  |
  | http://hourofcode.com/                                            | hourofcode.com home        |
  | http://hourofcode.com/promote                                     | hourofcode.com promote     |
  | http://csedweek.org                                               | csedweek.org home          |
  | http://csedweek.org/about                                         | csedweek.org about         |
  | http://uk.code.org/                                               | uk.code.org home           |
  | http://uk.code.org/about                                          | uk.code.org about          |
  | http://ro.code.org/                                               | ro.code.org home           |
  | http://ro.code.org/about                                          | ro.code.org about          |
  | http://advocacy.code.org/                                         | advocacy.code.org home     |
