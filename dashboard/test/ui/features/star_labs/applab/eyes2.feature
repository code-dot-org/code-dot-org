@eyes
@as_student
Feature: App Lab Eyes - Part 2

Scenario: Applab visualization scaling
  When I open my eyes to test "Applab visualization scaling"
  And I am on "http://studio.code.org/projects/applab/new"
  And I rotate to landscape
  And I wait for the page to fully load
  And I switch to design mode

  Then I drag a TEXT_AREA into the app
  And I press keys "Here is a bunch of text" for element "#design-properties textarea"
  And I set input "xpos" to "100"
  And I set input "ypos" to "100"

  Then I switch to code mode
  And I press "show-code-header"
  And I add code for a canvas and a button
  And I press "runButton"
  And I see no difference for "medium scaling" using stitch mode "none"

  Then I drag the visualization grippy by 100 pixels
  And I see no difference for "large scaling" using stitch mode "none"

  Then I drag the visualization grippy by -400 pixels
  And I see no difference for "small scaling" using stitch mode "none"

  Then I close my eyes

Scenario: Applab embedded level
  When I open my eyes to test "Applab embedded level"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/12"
  And I rotate to landscape
  And I see no difference for "embedded level"
  Then I close my eyes

Scenario: Applab widget mode
  When I open my eyes to test "Applab widget mode"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/22"
  And I wait until element "#start_over_button" is visible
  And I see no difference for "widget mode level"
  Then I close my eyes

Scenario: Applab Instructions in Top Pane
  When I open my eyes to test "Applab Instructions in top pane"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/9"
  And I wait for the page to fully load
  And I see no difference for "top instructions enabled on standard level"
  Then I click selector ".fa-chevron-circle-up"
  And I see no difference for "top instructions collapsed"
  Then I click selector ".fa-chevron-circle-down"
  And I see no difference for "top instructions uncollapsed"
  Then I press "hide-toolbox-icon"
  And I see no difference for "toolbox collapsed"

  When I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/10"
  And I wait for the page to fully load
  And I see no difference for "top instructions enabled on instructionless level"

  When I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/12"
  And I wait for the page to fully load
  And I see no difference for "top instructions enabled on embed level"
  Then I close my eyes
