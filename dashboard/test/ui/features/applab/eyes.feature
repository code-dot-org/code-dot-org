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
  And I close the dialog
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

  Then I drag the visualization grippy by 100 pixels
  And I see no difference for "large scaling"

  Then I drag the visualization grippy by -400 pixels
  And I see no difference for "small scaling"

  Then I close my eyes

Scenario: Applab embedded level
  When I open my eyes to test "Applab embedded level"
  And I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/12"
  And I rotate to landscape
  And I close the dialog
  And I see no difference for "embedded level"
  Then I close my eyes

Scenario: Applab Instructions in Top Pane
  When I open my eyes to test "Applab Instructions in top pane"
  And I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/9?topInstructions=true"
  And I wait to see "#runButton"
  And I see no difference for "top instructions enabled on standard level"
  Then I click selector ".fa-chevron-circle-down"
  And I see no difference for "top instructions collapsed"
  Then I click selector ".fa-chevron-circle-up"
  And I see no difference for "top instructions uncollapsed"
  Then I click selector "#hide-toolbox-icon"
  And I see no difference for "toolbox collapsed"

  When I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/10"
  And I wait to see "#runButton"
  And I see no difference for "top instructions enabled on instructionless level"

  When I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/12"
  And I wait to see "#runButton"
  And I see no difference for "top instructions enabled on embed level"

  Then I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/9?topInstructions=false"
  And I wait to see "#runButton"

  When I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/9"
  And I wait to see "#runButton"
  And I see no difference for "top instructions disabled on standard level"

  When I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/10"
  And I wait to see "#runButton"
  And I see no difference for "top instructions disabled on instructionless level"

  When I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/12"
  And I wait to see "#runButton"
  And I see no difference for "top instructions disabled on embed level"
  Then I close my eyes

Scenario: Applab Instructions Resize
  When I open my eyes to test "Applab instructions resize"
  And I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/9?topInstructions=true"
  And I wait to see "#runButton"
  And I see no difference for "base case"
  Then I drag the instructions grippy by -150 pixels
  And I see no difference for "small instructions"
  Then I drag the instructions grippy by 250 pixels
  And I see no difference for "big instructions"
  Then I drag the visualization grippy by -200 pixels
  And I see no difference for "small visualization"
  Then I am on "http://learn.code.org/s/allthethings/stage/18/puzzle/9?topInstructions=false"
  And I wait to see "#runButton"
  Then I close my eyes
