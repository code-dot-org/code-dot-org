@no_ie
@no_mobile
@dashboard_db_access
Feature: App Lab Scenarios

  Background:
    Given I sign in as a student
    And I start a new Applab project

  Scenario: App Lab Share
    # Create an app with a "hello world" button (omitting closing paren for auto-correct).
    Given I switch to text mode
    And I press keys "button('hello', 'world" for element ".ace_text-input"
    And I press "runButton"
    And I wait until element "#divApplab > .screen > button#hello" is visible
    And element "#divApplab > .screen > button#hello" contains text "world"
    And I press "resetButton"

    When I navigate to the shared version of my project
    And I wait until element "#divApplab > .screen > button#hello" is visible

    Then element "#divApplab > .screen > button#hello" contains text "world"
    And element "#codeModeButton" is hidden
    And element "#designModeButton" is hidden
    And element "#viewDataButton" is hidden

  # bbuchanan: Working to fix this test in Safari
  @no_safari
  Scenario: Can type in textarea on share page
    Given I switch to design mode
    And I drag a textarea into the app
    When I navigate to the shared version of my project
    And I press keys "XYZZY" for element ".screen > #text_area1" when it appears
    Then element ".screen > #text_area1" contains text "XYZZY"
