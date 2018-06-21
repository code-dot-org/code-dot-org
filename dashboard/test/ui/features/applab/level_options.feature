@dashboard_db_access
@as_student
Feature: App Lab Level Options

Scenario: Table data in level definition appears in data browser
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/16"
  And I wait for the page to fully load
  And I press "dataModeButton"
  And I wait until element "#dataOverview" is visible
  And I wait until element "a:contains(table_name2)" is visible
  And I click selector "a:contains(table_name2)"
  And I wait until element "#dataTable" is visible
  And I wait until element "td:contains(Seattle)" is visible
