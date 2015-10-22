@no_ie
@no_mobile
@dashboard_db_access
Feature: App Lab Scenarios

  Background:
    Given I sign in as a student
    And I start a new Applab project

  Scenario: App Lab Http Image
    # Create an app with an http image.
    When I switch to text mode
    And I press keys "image('test123', 'http://example.com')" for element ".ace_text-input"
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
    And Applab HTML has no button

  Scenario: Can read and set button text
    Given I switch to text mode
    And I press keys "button('testButton1', 'Peanut Butter');\n" for element ".ace_text-input"
    And I press keys "button('testButton2', 'Jelly');\n" for element ".ace_text-input"
    And I press keys "setText('testButton1', getText('testButton2'));\n" for element ".ace_text-input"
    When I press "runButton"
    And I wait until element "#divApplab > .screen > button#testButton2" is visible
    Then element "#testButton1" contains text "Jelly"
    Then element "#testButton2" contains text "Jelly"

  Scenario: Text is preserved when reading and setting newlines in textarea
    Given I switch to design mode
    And I drag a TEXT_AREA into the app
    Then I switch to code mode
    And I switch to text mode
    And I press keys "setText('text_area1', 'Line 1\\nLine 2\\n\\nLine3');\n" for element ".ace_text-input"
    And I press keys "for (var i = 0; i < 100; i++) { setText('text_area1', getText('text_area1')); }" for element ".ace_text-input"
    When I press "runButton"
    And I wait until element "#divApplab > .screen > div#text_area1" is visible
    Then element "div#text_area1" has html "Line 1<div>Line 2</div><div><br></div><div>Line3</div>"

  @no_mobile
  @no_safari
  Scenario: Upload Image Asset
    When I press "designModeButton"
    And I press "manage-assets-button"
    And I wait to see a dialog titled "Manage Assets"
    And I wait until element "#upload-asset" is visible
    And I upload the file named "artist_image_1.png"
    And I wait until element ".assetRow td:contains(artist_image_1.png)" is visible

    # Delete asset
    Then I press the first ".btn-danger" element
    And I press the first ".btn-danger" element
    And I wait until element "#manage-asset-status" contains text "successfully deleted!"
