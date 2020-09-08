@eyes
@as_student
Feature: App Lab Eyes -  Part 1

Scenario: Design elements are visible in local and shared projects
  When I open my eyes to test "applab eyes"
  Given I start a new Applab project
  And I wait for the page to fully load
  Then I see no difference for "initial load" using stitch mode "none"
  And I press "show-code-header"
  And I add code for a canvas and a button
  And I press "runButton"
  Then I see no difference for "button should be visible" using stitch mode "none"
  And I click selector ".project_share"
  And I wait to see a dialog titled "Share your project"
  Then I see no difference for "project share dialog" using stitch mode "none"
  And I navigate to the share URL
  And I wait until element "#divApplab" is visible
  Then I see no difference for "app lab share"
  And I close my eyes

Scenario: App Lab UI elements from initial code and html
  When I open my eyes to test "App Lab UI Elements from initial code and html"
  And I rotate to landscape
  # this level displays each ui element by generating it dynamically as well as
  # displaying design-mode-created elements.
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/9?noautoplay=true"
  And I wait for the page to fully load
  And element "#runButton" is visible
  Then I see no difference for "design mode elements in code mode"
  And I press "runButton"
  # wait for the last dynamically generated element to appear
  And I wait to see "#radioid"
  Then I see no difference for "dynamically generated elements in code mode"
  And I press "designModeButton"
  And I wait for the page to fully load
  Then I see no difference for "design mode elements in design mode"
  And I close my eyes

Scenario: Text area with multiple lines, radio button, checkbox
  Given I start a new Applab project
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

Scenario: Applab Instructions Resize
  When I open my eyes to test "Applab instructions resize"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/9"
  And I wait for the page to fully load
  And I see no difference for "base case"
  Then I drag the instructions grippy by -150 pixels
  And I see no difference for "small instructions"
  Then I drag the instructions grippy by 250 pixels
  And I see no difference for "big instructions"
  Then I drag the visualization grippy by -200 pixels
  And I see no difference for "small visualization"
  Then I close my eyes
