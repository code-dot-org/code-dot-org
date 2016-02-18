@dashboard_db_access
@as_student
Feature: App Lab HTML Sanitization

  Background:
    Given I start a new Applab project

  Scenario: Elements do not become nested
    Given I switch to design mode
    When I drag a SCREEN into the app
    And I drag a SCREEN into the app
    And I drag a LABEL into the app
    And I drag a TEXT_AREA into the app
    And I drag a BUTTON into the app

    And I press "runButton"
    And I wait to see "#screen2"

    Then element "#screen2" is a child of element "#divApplab"
    And element "#screen3" is a child of element "#divApplab"
    And element "#text_area1" is a child of element "#screen3"
    And element "#button1" is a child of element "#screen3"
