@as_student
Feature: App Lab HTML Sanitization

  Background:
    Given I start a new Applab project
    And I wait for the page to fully load

  Scenario: Elements do not become nested
    Given I switch to design mode
    When I drag a SCREEN into the app
    And I drag a SCREEN into the app
    And I drag a LABEL into the app
    # We should set label text via the property editor instead of editing the DOM directly,
    # if we ever figure out how to make React notice changes to input fields in IE.
    And I set selector "#design_label1" text to ""
    And I drag a TEXT_AREA into the app
    And I drag a BUTTON into the app

    And I press "runButton"
    And I wait to see "#screen2"

    # labels and text areas are only in danger of collapsing when they are empty.
    And element "#label1" has text ""
    And element "#text_area1" has text ""

    Then element "screen2" is a child of element "divApplab"
    And element "screen3" is a child of element "divApplab"
    And element "text_area1" is a child of element "screen3"
    And element "button1" is a child of element "screen3"
