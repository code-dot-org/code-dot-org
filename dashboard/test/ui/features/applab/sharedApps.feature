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

  Scenario: Can click a button in shared app
    Given I switch to text mode
    And I press keys "button('testButton1', 'Click me'); onEvent('testButton1', 'click', function() { setText('testButton1', 'Clicked'); });" for element ".ace_text-input"
    When I navigate to the shared version of my project
    And I wait until element "#divApplab > .screen > button#testButton1" is visible
    Then element "#testButton1" contains text "Click me"
    When I press "testButton1"
    Then element "#testButton1" contains text "Clicked"

  Scenario: Can type in text input on share page
    Given I switch to design mode
    And I drag a TEXT_INPUT into the app
    When I navigate to the shared version of my project
    And I wait until element ".screen > input" is visible
    And I press keys "GLULX" for element ".screen > input"
    Then element ".screen > input" has value "GLULX"

  Scenario: Can type in textarea on share page
    Given I switch to design mode
    And I drag a TEXT_AREA into the app
    When I navigate to the shared version of my project
    And I wait until element ".screen > #text_area1" is visible
    And I press keys "XYZZY" for element ".screen > #text_area1"
    Then element ".screen > #text_area1" contains text "XYZZY"
