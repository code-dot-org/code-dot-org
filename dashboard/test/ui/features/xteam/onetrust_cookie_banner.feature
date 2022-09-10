@eyes
Feature: OneTrust Cookie banner on various sites

Scenario Outline: Show onetrust cookie banner on GDPR country but not the US
  When I open my eyes to test "<test_name>"
  And I am on "<url>?otgeo=gb&onetrust_cookie_scripts=production"
  And I wait to see "#onetrust-banner-sdk"
  Then I see no difference for "OneTrust cookie banner on UK"

  Then I am on "<url>?otgeo=us&onetrust_cookie_scripts=production"
  And I wait until element "#onetrust-banner-sdk" is not visible
  Then I see no difference for "OneTrust cookie banner on US"

  Then I close my eyes

Examples:
  | url                                                               | test_name                  |
  | http://code.org/about                                             | code.org about             |
  | http://hourofcode.com/uk                                          | hourofcode hompage         |
  | http://studio.code.org/s/frozen/lessons/1/levels/1                | studio.code.org puzzle     |
