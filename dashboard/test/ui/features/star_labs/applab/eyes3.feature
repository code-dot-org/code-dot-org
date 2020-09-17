@eyes
@as_student
Feature: App Lab Eyes -  Part 3

Scenario: Data Browser
  Given I open my eyes to test "Applab Data Browser"

  When I start a new Applab project
  Then I see no difference for "initial load" using stitch mode "none"

  When I switch to data mode
  Then I see no difference for "data overview"

  When I press keys "foo" for element "#data-browser input"
  And I click selector "#data-browser button:contains(Add)"
  And I wait until element "#dataTable" is visible
  Then I see no difference for "data table"

  When I press enter key
  And I wait until element "th .test-tableNameDiv:contains(column1)" is visible
  And I press "addColumnButton"
  And I press enter key
  And I press keys "1" for element "#addDataTableRow :nth-child(2) input"
  And I press keys "2" for element "#addDataTableRow :nth-child(3) input"
  And element "#addDataTableRow button:contains(Add Row)" is visible
  And I click selector "#addDataTableRow button:contains(Add Row)"
  And I wait until element "button:contains(Edit)" is visible
  Then I see no difference for "data table with one row of data"

  When I click selector "#dataTable button:contains(Clear table)"
  And I wait until element "#dataTable .modal-body" is visible
  Then I see no difference for "clear table confirmation dialog"

  When element ".modal-body button:contains(Cancel)" is visible
  And I click selector ".modal-body button:contains(Cancel)"
  And I press "uitest-tableDebugLink"
  Then I see no difference for "data table debug view"

  And I click selector "#data-library-container span:contains(DATA TABLES)"
  And I wait until element "#data-library-container" is visible
  And element "#data-library-container span:contains(KEY/VALUE PAIRS)" is visible
  And I click selector "#data-library-container span:contains(KEY/VALUE PAIRS)"
  And I wait until element "tr:contains(Add pair)" is visible
  Then I see no difference for "empty data properties"

  When I press keys "1" for element "#uitest-addKeyValuePairRow :nth-child(1) input"
  And I press keys "2" for element "#uitest-addKeyValuePairRow :nth-child(2) input"
  And I click selector "button:contains(Add pair)"
  And I wait until element "button:contains(Edit)" is visible
  Then I see no difference for "data properties with one row"

  And I close my eyes
