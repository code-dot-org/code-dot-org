@eyes
Feature: Cookie banner on various sites

Scenario Outline: Show cookie banner, dismiss it and confirm it's dismissed
  When I open my eyes to test "<test_name>"
  And I am on "<url>?show_cookie_banner_on_test=true"
  And I dismiss the language selector
  And I rotate to landscape
  And I wait to see "#accept-cookies"
  Then I see no difference for "initial load with cookie banner"

  And I press "accept-cookies"
  Then I wait until element "#accept-cookies" is not visible

  Then I reload the page
  Then I am on "<url>?show_cookie_banner_on_test=true"
  And I wait until element "#accept-cookies" is not visible

  Then I close my eyes

Examples:
  | url                                                               | test_name                  |
  | http://code.org/about                                             | code.org about             |
  | http://studio.code.org/s/frozen/stage/1/puzzle/1                  | studio.code.org puzzle     |
