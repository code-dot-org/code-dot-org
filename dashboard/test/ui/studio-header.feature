Feature: Use the header

Scenario: Use the progress header
  Given I am on "http://learn.code.org/s/course3/stage/7/puzzle/3?noautoplay=true"
  When I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And element ".header_popup_link" is visible
  And I press ".header_popup_link"
  And element ".header_popup" is visible
