Feature: Navigating with the header

Background:
  Given I am on "http://studio.code.org/s/course1/stage/3/puzzle/2"
  And I rotate to landscape
  And I press "x-close"
  And I wait to see ".progress_container"

Scenario: Header progress appears
  Then element ".header_level_text" contains text "Stage"
  And element ".header_popup_link_text" has text "MORE"
  And I do not see ".header_popup"

Scenario: Choose a level using the progress widget
  When I press ".progress_container .puzzle_outer_level:eq(4) a" DOM using jQuery
  Then check that I am on "http://studio.code.org/s/course1/stage/3/puzzle/5"

Scenario: Open the navigation popup, stats block appears, click a level
  When I press ".header_popup_link" using jQuery
  Then I see ".header_popup"
  And element ".header_popup_header" contains text "progress"
  And I wait to see ".user-stats-block"
  Then element ".user-stats-block .game-group:eq(3)" contains text "Stage"
  And element ".user-stats-block .puzzle_outer_current" contains text "2"
  When I press ".user-stats-block .game-group:eq(3) .level:eq(6) a" DOM using jQuery
  Then check that I am on "http://studio.code.org/s/course1/stage/4/puzzle/7"
