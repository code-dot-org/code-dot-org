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
    And I press "clear-puzzle-header"
    And element "#confirm-button" is visible
    And I press "confirm-button"
    And Applab HTML has no button

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
