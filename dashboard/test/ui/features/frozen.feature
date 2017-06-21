Feature: Artist Frozen Levels

Scenario: Loading the first frozen level
  Then I am on "http://studio.code.org/s/frozen/stage/1/puzzle/1?noautoplay=true"
  And I wait for the page to fully load
  And element ".blocklyText:contains(when\xa0run)" is visible
