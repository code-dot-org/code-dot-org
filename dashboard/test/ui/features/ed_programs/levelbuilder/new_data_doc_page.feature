@no_mobile
Feature: Creating and seeing data docs

  Scenario: Create new data doc
    Given I create a levelbuilder named "Angela"
    And I am on "http://studio.code.org/data_docs/new"
    And I wait until element "#form" is visible

    And I enter a temp data doc key and temp data doc name
    And I press keys "Description of Doc" for element "textarea"
    And I click "button[type='submit']" to load a new page

    Then I wait for the temp data doc page to load
    And element "h1" contains of the temp data doc
    And element "div#data-doc-content" contains text "Description of Doc"

    And I delete the temp data doc
