@eyes
@dashboard_db_access
Feature: App Lab Eyes

Scenario: Button shows up on top of canvas
  Given I am on "http://learn.code.org/"
  And I am a student
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
  Given I sign in as a student
  And I rotate to landscape
  When I open my eyes to test "App Lab UI Elements from initial code and html"
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
