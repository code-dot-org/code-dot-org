@eyes
@dashboard_db_access
@as_student
Feature: App Lab Eyes

Scenario: Button shows up on top of canvas
  When I open my eyes to test "applab eyes"
  And I am on "http://learn.code.org/projects/applab/new"
  And I rotate to landscape
  Then I see no difference for "initial load"
  And I press "show-code-header"
  And I add code for a canvas and a button
  And I press "runButton"
  Then I see no difference for "button should be visible"
  And I click selector ".project_share"
  And I wait to see a dialog titled "Share your project"
  And I navigate to the share URL
  And I wait until element "#divApplab" is visible
  Then I see no difference for "app lab share"
  And I close my eyes

Scenario: App Lab UI elements from initial code and html
  When I open my eyes to test "App Lab UI Elements from initial code and html"
  And I rotate to landscape
  # this level displays each ui element by generating it dynamically as well as
  # displaying design-mode-created elements.
  And I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/9?noautoplay=true"
  And I wait to see "#runButton"
  And element "#runButton" is visible
  Then I see no difference for "design mode elements in code mode"
  And I click selector "#runButton"
  # wait for the last dynamically generated element to appear
  And I wait to see "#radioid"
  Then I see no difference for "dynamically generated elements in code mode"
  And I click selector "#designModeButton"
  And I wait until element "#runButton" is visible
  Then I see no difference for "design mode elements in design mode"
  And I close my eyes

Scenario: Text area with multiple lines, radio button, checkbox
  Given I start a new Applab project
  And I rotate to landscape
  And I switch to design mode
  And I open my eyes to test "applab design mode"

  Then I drag a TEXT_AREA into the app
  And I press keys "This is a lot of text that should wrap onto a second line" for element "#design-properties textarea"
  And I set input "xpos" to "0"
  And I set input "ypos" to "0"
  Then I see no difference for "text area in upper left"
  Then I delete the current design mode element

  Then I drag a TEXT_AREA into the app
  And I press keys "This is a bunch of text" for element "#design-properties textarea"
  And I press enter key
  And I press enter key
  And I press keys "Here is more text on a new line"
  And I set input "xpos" to "0"
  And I set input "ypos" to "0"
  Then I see no difference for "text area in upper left"
  Then I delete the current design mode element

  Then I drag a RADIO_BUTTON into the app
  And I set groupable input "xpos" to "0"
  And I set groupable input "ypos" to "0"
  Then I see no difference for "radio button in upper left"
  Then I delete the current design mode element

  Then I drag a CHECKBOX into the app
  And I set input "xpos" to "0"
  And I set input "ypos" to "0"
  Then I see no difference for "checkbox in upper left"
  Then I delete the current design mode element
  And I close my eyes

Scenario: Applab visualization scaling
  When I open my eyes to test "Applab visualization scaling"
  And I am on "http://learn.code.org/projects/applab/new"
  And I rotate to landscape
  And I wait to see "#runButton"
  And I switch to design mode

  Then I drag a TEXT_AREA into the app
  And I press keys "Here is a bunch of text" for element "#design-properties textarea"
  And I set input "xpos" to "100"
  And I set input "ypos" to "100"

  Then I switch to code mode
  And I press "show-code-header"
  And I add code for a canvas and a button
  And I press "runButton"
  And I see no difference for "medium scaling"

  Then I drag the grippy by 100 pixels
  And I see no difference for "large scaling"

  Then I drag the grippy by -400 pixels
  And I see no difference for "small scaling"

  Then I close my eyes

Scenario: Applab embedded level
  When I open my eyes to test "Applab embedded level"
  And I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/12"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And I see no difference for "embedded level"
  Then I close my eyes
