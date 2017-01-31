Feature: Maker Projects

@as_student @chrome
Scenario: /p/makerlab enables maker toolkit categories
  Given I am on "http://studio.code.org/projects/makerlab"
  And I get redirected to "/projects/makerlab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait until element ".droplet-palette-group-header:contains(Maker Lab)" is visible

@as_student @chrome
Scenario: /p/applab does not enable maker toolkit categories
  Given I am on "http://studio.code.org/projects/applab"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait until element ".droplet-palette-group-header:contains(Maker Lab)" is not visible
