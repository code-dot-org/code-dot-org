@as_student
Feature: App Lab Scenarios

  Background:
    Given I start a new Applab project
    And I wait for the page to fully load

  Scenario:
    # Project Template Workspace Icon should not appear since this is not a project template backed level
    Then element ".projectTemplateWorkspaceIcon" is not visible

  # (brad) Disabled because it appears to be hanging on test after attempting to
  # fix an IE-specific issue this morning.  I'm on the hook to re-enable by
  # Thursday, Nov 16th 2017.
  @no_ie
  Scenario: App Lab Http Image
    # Create an app with an http image.
    When I ensure droplet is in text mode
    And I append text to droplet "image('test123', 'http://example.com')"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > img#test123" is visible
    And element "#divApplab > .screen > img#test123" has attribute "src" equal to "//studio.code.org/media?u=http%3A%2F%2Fexample.com"

  Scenario: App Lab Clear Puzzle and Design Mode
    # Create an app with a design mode button, then clear the puzzle
    Given I switch to design mode
    And I drag a BUTTON into the app
    And I switch to code mode
    And Applab HTML has a button
    And I reset the puzzle to the starting version
    And I wait to see "#divApplab"
    And I wait until element "#divApplab" is visible
    And Applab HTML has no button

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

  Scenario: Change event works in text input and text area
    Given I switch to design mode
    And I drag a TEXT_INPUT into the app
    And I drag a TEXT_AREA into the app
    And I switch to code mode
    And I ensure droplet is in text mode
    And I append text to droplet "onEvent('text_input1', 'change', function(event) {\n"
    And I append text to droplet "  console.log(event.targetId + ': ' + getText('text_input1'));\n"
    And I append text to droplet "});\n\n"
    And I append text to droplet "onEvent('text_area1', 'change', function(event) {\n"
    And I append text to droplet "  console.log(event.targetId + ': ' + getText('text_area1'));\n"
    And I append text to droplet "});"

    # in text input, blur produces a change event
    When I press "runButton"
    And I wait until element "#divApplab > .screen > div#text_area1" is visible
    And I press keys "123" for element "#text_input1"
    And I blur selector "#text_input1"
    Then element "#debug-output" has escaped text "\"text_input1: 123\""

    # in a text input, enter produces a change event but then blur does not
    When I press keys "456\n" for element "#text_input1"
    Then element "#debug-output" has escaped text "\"text_input1: 123\"\"text_input1: 123456\""
    And I blur selector "#text_input1"
    Then element "#debug-output" has escaped text "\"text_input1: 123\"\"text_input1: 123456\""

    # in a text area, blur produces a change event. sending keystrokes (especially 'enter')
    # to a contentetiable div was too hard to test here due to browser differences.
    When I press "resetButton"
    And I wait until element "#runButton" is visible
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
