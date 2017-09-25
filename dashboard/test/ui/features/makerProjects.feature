# Testing likely browser-agnostic end-to-end behavior, so only run for Chrome.
@as_student @chrome
Feature: Projects Maker API enabling

Scenario: /projects/makerlab enables maker toolkit categories
  Given I am on "http://studio.code.org/projects/makerlab"
  And I get redirected to "/projects/makerlab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait until element ".droplet-palette-group-header:contains(Maker)" is visible

Scenario: /projects/makerlab/new enables maker toolkit categories
  Given I am on "http://studio.code.org/projects/makerlab/new"
  And I get redirected to "/projects/makerlab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait until element ".droplet-palette-group-header:contains(Maker)" is visible

Scenario: /projects/applab does not enable maker toolkit categories
  Given I am on "http://studio.code.org/projects/applab"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait until element ".droplet-palette-group-header:contains(Maker)" is not visible
