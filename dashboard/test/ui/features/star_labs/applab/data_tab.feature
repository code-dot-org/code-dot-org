# Maddie (10/19/2020) disabled in IE because "And I press keys" step does not work in IE.
# https://github.com/code-dot-org/code-dot-org/pull/24646
@no_ie
@no_mobile
@as_student
Feature: App Lab Data Tab

  Background:
    # Navigate to data tab from a new Applab project
    Given I start a new Applab project
    And I wait for the page to fully load
    Then I click selector "#dataModeButton"
    And I wait until element "#dataTablesBody" is visible

  Scenario: Datasets Panel
    # Import a dataset
    Then I click selector ".uitest-dataset-category:first-of-type" once I see it
    Then I click selector ".uitest-dataset-table-link:first-of-type" once I see it
    Then I click selector ".uitest-dataset-preview-btn:first-of-type" once I see it
    And I wait until element ".modal h1" is visible
    Then I save the table name from element ".modal h1"
    Then I click selector ".modal button:first-of-type" once I see it
    Then I wait until element "#dataTablesBody table tr:eq(2) td:eq(0)" contains the saved table name

  Scenario: Data Tables Tab
    # Create a new table
    And I press keys "My new table" for element ".uitest-add-table-input:first-of-type"
    And I click selector ".uitest-add-table-btn:first-of-type"
    Then I wait until element "#dataTable span:first-of-type" contains text "My new table"

    # Rename default column
    And I wait until element ".test-tableNameDiv:first-of-type" contains text "column1"
    And I click selector ".dropdown.pull-right:first-of-type"
    And I press keys "number column" for element ".uitest-data-table-column:nth-of-type(2) input"
    When I press enter key
    Then I wait until element ".test-tableNameDiv:first-of-type" contains text "number column"

    # Add a row
    And I click selector "#addDataTableRow input:first-of-type"
    And I press keys "2" for element "#addDataTableRow input:first-of-type"
    And I click selector "#addDataTableRow button:first-of-type"
    Then I wait until element ".uitest-data-table-row:eq(0) td:nth-child(2)" contains text "2"

    # Edit a row
    And I click selector ".uitest-data-table-row:eq(0) td:nth-child(4) button:first-of-type"
    Then I click selector ".uitest-data-table-row:eq(0) td:nth-child(2) input:first-of-type" once I see it
    And I press keys "1" for element ".uitest-data-table-row td:nth-child(2) input"
    And I click selector ".uitest-data-table-row:eq(0) td:nth-child(4) button:first-of-type"
    Then I wait until element ".uitest-data-table-content:first-of-type td:nth-child(2)" contains text "21"

  Scenario: Key/Value Pairs Tab
    Then I click selector "#keyValuePairsTab" once I see it
    And I wait until element "#keyValuePairsBody" is visible

    # Add a key/value pair
    And I press keys "numKey" for element "#uitest-addKeyValuePairRow td:first-of-type input"
    And I press keys "3" for element "#uitest-addKeyValuePairRow td:nth-child(2) input"
    Then I click selector "#uitest-addKeyValuePairRow td:nth-child(3) button"
    Then I wait until element ".uitest-kv-table-row td:nth-child(1)" contains text "numKey"
    Then I wait until element ".uitest-kv-table-row td:nth-child(2)" contains text "3"

    # Edit a key/value pair
    And I click selector ".uitest-kv-table-row td:nth-child(3) button:first-of-type"
    And I press keys "00" for element ".uitest-kv-table-row td:nth-child(2) input"
    And I click selector ".uitest-kv-table-row td:nth-child(3) button:first-of-type"
    Then I wait until element ".uitest-kv-table-row td:nth-child(1)" contains text "numKey"
    Then I wait until element ".uitest-kv-table-row td:nth-child(2)" contains text "300"
