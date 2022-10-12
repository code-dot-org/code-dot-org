@no_mobile
Feature: Creating and deleting data docs

  Scenario: Create new data doc, see it on index page, and delete it
    Given I create a levelbuilder named "Angela"
    And I am on "http://studio.code.org/data_docs/edit"
    And I click selector "#create_new_data_doc"
    And I wait until element "#form" is visible

    And I enter a temp data doc key and temp data doc name
    And I press keys "Description of Doc" for element "textarea"
    And I click "button[type='submit']" to load a new page

    And I wait for the temp data doc page to load
    And element "h1" contains the name of the temp data doc
    And element "div#data-doc-content" contains text "Description of Doc"

    Then I am on "http://studio.code.org/data_docs"
    And I wait until element "#see-data-docs" is visible
    And element "a" contains the name of the temp data doc
    And the element contains the path to the temp data doc

    And I click selector "a:contains('Edit All')"
    And element "a" contains the name of the temp data doc
    And the element contains the path to the temp data doc
    And I click the icon to edit the data doc

    And I wait until element "#edit-data-doc" is visible
    And I press keys "New description of Doc" for element "textarea"
    And I click "button[type='submit']" to load a new page

    And I wait for the temp data doc page to load
    And element "h1" contains the name of the temp data doc
    And element "div#data-doc-content" contains text "New description of Doc"

    And I delete the temp data doc
