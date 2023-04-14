@as_student
Feature: App Lab Scenarios

  Background:
    Given I start a new Applab project
    And I wait for the page to fully load

  Scenario: Can read and set button text
    Given I ensure droplet is in text mode
    And I append text to droplet "button('testButton1', 'Peanut Butter');\n"
    And I append text to droplet "button('testButton2', 'Jelly');\n"
    And I append text to droplet "setText('testButton1', getText('testButton2'));\n"
    When I press "runButton"
    And I wait until element "#divApplab > .screen > button#testButton2" is visible
    Then element "#testButton1" contains text "Jelly"
    Then element "#testButton2" contains text "Jelly"

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

  Scenario: Change event works in text input
    Given I switch to design mode
    And I drag a TEXT_INPUT into the app
    And I switch to code mode
    And I ensure droplet is in text mode
    And I append text to droplet "onEvent('text_input1', 'change', function(event) {\n"
    And I append text to droplet "  console.log(event.targetId + ': ' + getText('text_input1'));\n"
    And I append text to droplet "});"

    # in text input, blur produces a change event
    When I press "runButton"
    And I wait until element with id "text_input1" is visible
    And I press keys "123" for element with id "text_input1"
    And I blur selector "#text_input1"
    Then element "#debug-output" has escaped text "\"text_input1: 123\""

    # in a text input, enter produces a change event but then blur does not
    When I press keys "456\n" for element with id "text_input1"
    Then element "#debug-output" has escaped text "\"text_input1: 123\"\"text_input1: 123456\""
    And I blur selector "#text_input1"
    Then element "#debug-output" has escaped text "\"text_input1: 123\"\"text_input1: 123456\""

Scenario: Change event works in text area
    Given I switch to design mode
    And I drag a TEXT_AREA into the app
    And I switch to code mode
    And I ensure droplet is in text mode
    And I append text to droplet "onEvent('text_area1', 'change', function(event) {\n"
    And I append text to droplet "  console.log(event.targetId + ': ' + getText('text_area1'));\n"
    And I append text to droplet "});"

    # in a text area, blur produces a change event. sending keystrokes (especially 'enter')
    # to a contentetiable div was too hard to test here due to browser differences.
    And I press "runButton"
    And I wait until element "#divApplab > .screen > div#text_area1" is visible
    And I focus selector "#text_area1"
    And I set selector "#text_area1" text to "abc"
    And I blur selector "#text_area1"
    Then element "#debug-output" has text "\"text_area1: abc\""

  @no_mobile
  Scenario: Upload Image Asset
    When I press "designModeButton"
    And I press the settings cog
    And I press the settings cog menu item "Manage Assets"
    And I wait to see a dialog titled "Manage Assets"
    And I wait until element "#upload-asset" is visible
    And I upload the file named "artist_image_1.png"
    And I wait until element ".assetRow td:contains(artist_image_1.png)" is visible

    # Delete asset
    Then I press the first ".btn-danger" element
    And I press the first ".btn-danger" element
    And I wait until element "#manage-asset-status" contains text "successfully deleted!"
