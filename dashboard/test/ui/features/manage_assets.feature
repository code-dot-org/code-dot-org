@no_mobile
Feature: Manage Assets

  @no_safari @no_ie
  Scenario: The manage assets dialog contains the option to record audio on Chrome and Firefox.
    Given I am a student
    And I start a new Game Lab project
    And I wait for the page to fully load
    And I open the Manage Assets dialog
    Then I click selector "#record-asset" once I see it
    And I wait until element ".modal-content" contains text "Your computer is not set-up to record audio."
    
  @no_chrome @no_firefox
  Scenario: The manage assets dialog contains the option to record audio on Safari or IE.
    Given I am a student
    And I start a new Game Lab project
    And I wait for the page to fully load
    And I open the Manage Assets dialog
    Then I wait until element "#record-asset" is not visible

  Scenario: The manage assets dialog displays the audio preview, and toggles between play and pause button.
    Given I am a student
    And I start a new Game Lab project
    And I wait for the page to fully load
    And I open the Manage Assets dialog
    And I wait to see a dialog titled "Manage Assets"
    And I wait until element "#upload-asset" is visible
    And I upload the file named "test_audio.mp3"
    And I wait until element ".assetRow td:contains(test_audio.mp3)" is visible
    And element ".assetThumbnail" is visible
    And element ".fa-play-circle" is visible

  # Brad (2018-11-14) Skip on IE due to blocked pop-ups
  @no_ie
  Scenario: The manage assets dialog displays an image thumbnail and opens in a new tab when clicked
    Given I am a student
    And I start a new Game Lab project
    And I wait for the page to fully load
    And I open the Manage Assets dialog
    And I wait to see a dialog titled "Manage Assets"
    And I wait until element "#upload-asset" is visible
    And I upload the file named "artist_image_1.png"
    And I wait until element ".assetRow td:contains(artist_image_1.png)" is visible

    And I press "ui-image-thumbnail" to load a new tab
    And check that the URL matches "/v3/assets/.*/artist_image_1.png"

  Scenario: From WebLab, the manage assets dialog does not contain the option to record audio.
    Given I am a student
    And I am on "http://studio.code.org/projects/weblab/new"
    Then I click selector "#ui-test-add-image" once I see it
    Then I wait until element "#record-asset" is not visible
