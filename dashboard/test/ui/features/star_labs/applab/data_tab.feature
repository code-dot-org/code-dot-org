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

  Scenario: Data Tables Tab
    # Create a new table
    And I press keys "My new table" for element ".uitest-add-table-input:first-of-type"
    And I click selector ".uitest-add-table-btn:first-of-type"
    Then I wait until element "#dataTable span:first-of-type" contains text "My new table"

    # Rename default column
    And I wait until element ".test-tableNameDiv:first-of-type" contains text "column1"
    And I click selector ".dropdown.pull-right:first-of-type"
    And I press keys "number column" for element ".uitest-data-table-content:first-of-type th:nth-child(2) input"
    When I press enter key
    Then I wait until element ".test-tableNameDiv:first-of-type" contains text "number column"

    # Add a row
    And I click selector "#addDataTableRow input:first-of-type"
    And I press keys "2" for element "#addDataTableRow input:first-of-type"
    And I click selector "#addDataTableRow button:first-of-type"
    Then I wait until element ".uitest-data-table-content:first-of-type tr:nth-child(3) td:nth-child(2)" contains text "2"

    # Edit a row
    And I click selector ".uitest-data-table-content:first-of-type tr:nth-child(3) td:nth-child(4) button:first-of-type"
    Then I click selector ".uitest-data-table-content:first-of-type tr:nth-child(3) td:nth-child(2) input:first-of-type"
    And I press keys "1" for element ".uitest-data-table-content:first-of-type tr:nth-child(3) td:nth-child(2) input:first-of-type"
    And I click selector ".uitest-data-table-content:first-of-type tr:nth-child(3) td:nth-child(4) button:first-of-type"
    Then I wait until element ".uitest-data-table-content:first-of-type tr:nth-child(3) td:nth-child(2)" contains text "21"
