@no_ie
@dashboard_db_access
Feature: App Lab Scenarios

  Background:
    Given I am on "http://learn.code.org/"
    And I am a student
    And I am on "http://learn.code.org/users/sign_in"
    And I am on "http://learn.code.org/projects/applab"
    And I rotate to landscape
    And I wait until element "#runButton" is visible
    And element "#codeModeButton" is visible
    And element "#designModeButton" is visible
    And element "#viewDataButton" is visible

  @no_mobile
  Scenario: App Lab Share
    # Create an app with a "hello world" button (omitting closing paren for auto-correct).
    Then I press "show-code-header"
    And I wait to see Droplet text mode
    And I press keys "button('hello', 'world" for element ".ace_text-input"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    And element "#divApplab > .screen > button#hello" contains text "world"
    And I press "resetButton"

    # Share the app and load the share page.
    Then I click selector ".project_share"
    And I wait to see a dialog titled "Share your project"
    And I navigate to the share URL

    # Validate.
    And I wait until element "#resetButton" is visible
    And I wait until element "#divApplab > .screen > button#hello" is visible
    And element "#divApplab > .screen > button#hello" contains text "world"
    And element "#codeModeButton" is hidden
    And element "#designModeButton" is hidden
    And element "#viewDataButton" is hidden

  @no_mobile
  Scenario: App Lab Http Image
    # Create an app with an http image.
    Then I press "show-code-header"
    And I wait to see Droplet text mode
    And I press keys "image('test123', 'http://example.com')" for element ".ace_text-input"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > img#test123" is visible
    And element "#divApplab > .screen > img#test123" has attribute "src" equal to "//studio.code.org/media?u=http%3A%2F%2Fexample.com"

  @no_mobile
  Scenario: App Lab Clear Puzzle and Design Mode
    # Create an app with a design mode button, then clear the puzzle
    And I press "designModeButton"
    And I drag block matching selector "[data-element-type='BUTTON']" to block matching selector "#visualization"
    And I press "codeModeButton"
    And Applab HTML has a button
    And I press "clear-puzzle-header"
    And element "#confirm-button" is visible
    And I press "confirm-button"
    And Applab HTML has no button
