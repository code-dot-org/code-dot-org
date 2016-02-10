@dashboard_db_access
@as_student
Feature: App Lab Event Arguments

  Background:
    Given I start a new Applab project

  Scenario: Text input change event provides srcElementId
    Given I switch to text mode
    And I append text to droplet "textInput('text_input1', '');\n"
    And I append text to droplet "onEvent('text_input1', 'change', function(e) {\n"
    And I append text to droplet "  setText('text_input1', 'event on ' + e.srcElementId);\n"
    And I append text to droplet "});\n"

    When I press "runButton"
    And I wait until element ".screen > #text_input1" is visible
    And I press keys "XYZZY" for element ".screen > #text_input1"
    And I blur selector ".screen > #text_input1"

    Then element ".screen > #text_input1" has value "event on text_input1"

  Scenario: Textarea change event provides srcElementId
    Given I switch to text mode
    And I append text to droplet "onEvent('text_area1', 'change', function (e) {\n"
    And I append text to droplet "  setText('text_area1', 'event on ' + e.srcElementId);\n"
    And I append text to droplet "});\n"

    And I switch to design mode
    And I drag a TEXT_AREA into the app

    When I press "runButton"
    And I wait until element ".screen > #text_area1" is visible
    And I press keys "XYZZY" for element ".screen > #text_area1"
    And I blur selector ".screen > #text_area1"

    Then element ".screen > #text_area1" contains text "event on text_area1"
