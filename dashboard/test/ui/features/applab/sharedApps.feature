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
    And I press keys "button('testButton1', 'Click me');" for element ".ace_text-input"
    And I press keys "onEvent('testButton1', 'click', function() { setText('testButton1', 'Clicked'); });" for element ".ace_text-input"
    When I navigate to the shared version of my project
    And I wait until element "#divApplab > .screen > button#testButton1" is visible
    Then element "#testButton1" contains text "Click me"
    When I press "testButton1"
    Then element "#testButton1" contains text "Clicked"

  Scenario: Can change a dropdown value in shared app
    Given I switch to text mode
    And I press keys "dropdown('testDropdown', 'Option A', 'Option B', 'Option C');" for element ".ace_text-input"
    When I navigate to the shared version of my project
    And I wait until element ".screen > #testDropdown" is visible
    Then element "#testDropdown" has value "Option A"
    When I select the "Option B" option in dropdown "testDropdown"
    Then element "#testDropdown" has value "Option B"

  Scenario: Can change a radio button value in shared app
    Given I switch to text mode
    And I press keys "radioButton('radio1', false, 'testGroup');" for element ".ace_text-input"
    And I press keys "radioButton('radio2', false, 'testGroup');" for element ".ace_text-input"

    When I navigate to the shared version of my project
    And I wait until element ".screen > #radio2" is visible
    Then element "#radio1" is not checked
    And element "#radio2" is not checked

    When I press "radio1"
    Then element "#radio1" is checked
    And element "#radio2" is not checked

    When I press "radio2"
    Then element "#radio1" is not checked
    And element "#radio2" is checked

  Scenario: Can change a checkbox value in shared app
    Given I switch to text mode
    And I press keys "checkbox('checkbox1', false, 'testGroup');" for element ".ace_text-input"
    And I press keys "checkbox('checkbox2', false, 'testGroup');" for element ".ace_text-input"

    When I navigate to the shared version of my project
    And I wait until element ".screen > #checkbox2" is visible
    Then element "#checkbox1" is not checked
    And element "#checkbox2" is not checked

    When I press "checkbox1"
    Then element "#checkbox1" is checked
    And element "#checkbox2" is not checked

    When I press "checkbox2"
    Then element "#checkbox1" is checked
    And element "#checkbox2" is checked

  Scenario: Can type in text input on share page
    Given I switch to design mode
    And I drag a TEXT_INPUT into the app
    When I navigate to the shared version of my project
    And I wait until element ".screen > input" is visible
    And I press keys "GLULX" for element ".screen > input"
    Then element ".screen > input" has value "GLULX"

  # Known limitation of Selenium's Safari driver: Cannot use sendKeys to simulate
  # typing into a contenteditable div (which is what our Applab textareas are)
  # See https://code.google.com/p/selenium/issues/detail?id=4467
  @no_safari
  Scenario: Can type in textarea on share page
    Given I switch to design mode
    And I drag a TEXT_AREA into the app
    When I navigate to the shared version of my project
    And I wait until element ".screen > #text_area1" is visible
    And I press keys "XYZZY" for element ".screen > #text_area1"
    Then element ".screen > #text_area1" contains text "XYZZY"
