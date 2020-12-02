@as_student
Feature: App Lab Level Options

Scenario: Table data in level definition appears in data browser
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/16"
  And I wait for the page to fully load
  And I press "dataModeButton"
  And I wait until element "#data-library-container" is visible
  And I wait until element "a:contains(table_name2)" is visible
  And I click selector "a:contains(table_name2)"
  And I wait until element "#dataTable" is visible
  And I wait until element "td:contains(Seattle)" is visible

Scenario: Level defaults to design mode, students see design mode and teachers see code mode when viewing student work
  #As student
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/21"
  And I wait for the page to fully load
  And I wait to see Applab design mode
  Then I rotate to landscape
  And I wait to see "#runButton"

  #As teacher
  Then I sign in as "Teacher_Lillian"
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/21"
  And I wait for the page to fully load
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait for the page to fully load
  And I wait to see Applab code mode
