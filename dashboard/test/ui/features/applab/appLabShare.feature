@dashboard_db_access
Feature: App Lab Share

  Background:
    Given I am on "http://learn.code.org/"
    And I am a student
    And I am on "http://learn.code.org/users/sign_in"
    And I am on "http://learn.code.org/projects/applab"
    And I rotate to landscape
    And element "#runButton" is visible
    And element "#codeModeButton" is visible
    And element "#designModeButton" is visible
    And element "#viewDataButton" is visible

  @no_mobile
  Scenario: App Lab Share

    # Create an app with a "hello world" button.
    Then I press "show-code-header"
    And I wait until element ".ace_text-input" is visible
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
