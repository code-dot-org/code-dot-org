@no_mobile
Feature: Creating and deleting data docs

  Scenario: Create new data doc, see it on index page, and delete it
    Given I create a levelbuilder named "Angela"
    And I am on "http://studio.code.org/data_docs/edit"

    # create data doc
    And I click selector "#create_new_data_doc"
    And I wait until element "#form" is visible
    And I enter a temp data doc key and temp data doc name
    And I press keys "Description of Doc" for element "textarea"
    And I click "button[type='submit']" to load a new page

    # see created doc on its own page
    And I wait for the temp data doc page to load
    And element "h1" contains the name of the temp data doc
    And element "div#data-doc-content" contains text "Description of Doc"

    # see created doc on index page
    Then I am on "http://studio.code.org/data_docs"
    And I wait until element "#see-data-docs" is visible
    And element "a" contains the name of the temp data doc
    And the element contains the path to the temp data doc

    # edit data doc from edit all page
    Then I am on "http://studio.code.org/data_docs/edit"
    And element "a" contains the name of the temp data doc
    And the element contains the path to the temp data doc
    And I click the icon to edit the temp data doc
    And I wait for the temp data doc edit page to load
    And I press keys "New description of Doc" for element "textarea"
    And I click "button[type='submit']" to load a new page

    # see updated doc on its own page
    And I wait for the temp data doc page to load
    And element "h1" contains the name of the temp data doc
    And element "div#data-doc-content" contains text "New description of Doc"

    # delete doc
    Then I am on "http://studio.code.org/data_docs/edit"
    And I wait until element "#edit-all-data-docs" is visible
    And I click the icon to delete the temp data doc
    And I wait until element ".modal-body" is visible
    And element ".modal-body button:last" contains text "Delete"
    And I click selector ".modal-body button:last"
    And I wait until element ".modal-body" is not visible
    And the temp data doc is not visible
