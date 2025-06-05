@as_student
Feature: App Lab Scenarios 6

  Background:
    Given I start a new Applab project
    And I wait for the lab page to fully load

  Scenario: Text is preserved when reading and setting newlines in textarea
    Given I switch to design mode
    And I drag a TEXT_AREA into the app
    Then I switch to code mode
    And I ensure droplet is in text mode
    And I append text to droplet "setText('text_area1', 'Line 1\\nLine 2\\n\\nLine3');\n"
    And I append text to droplet "for (var i = 0; i < 100; i++) { setText('text_area1', getText('text_area1')); }"
    When I press "runButton"
    And I wait until element "#divApplab > .screen > div#text_area1" is visible
    Then element "div#text_area1" has html "Line 1<div>Line 2</div><div><br></div><div>Line3</div>"
