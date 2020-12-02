@eyes
@as_student
Feature: App Lab Eyes -  Part 4

Scenario: Applab debugging
  Given I start a new Applab project
  When I open my eyes to test "Applab debugging"
  And I press "show-code-header"
  And I add code for a canvas and a button
  And I click selector "#debug-area-header .fa-chevron-circle-up"
  Then I press "stepInButton"
  And I see no difference for "stepped in once" using stitch mode "none"
  Then I press "stepInButton"
  And I see no difference for "stepped in twice" using stitch mode "none"
  Then I press "stepInButton"
  And I see no difference for "stepped in thrice" using stitch mode "none"
  Then I press "show-code-header"
  And I wait to see Droplet block mode
  And I press "resetButton"
  And I click droplet gutter line 1
  And I see no difference for "droplet breakpoint" using stitch mode "none"
  Then I close my eyes

Scenario: Drag to delete
  Given I start a new Applab project
  And I switch to design mode
  And I open my eyes to test "Drag to delete"

  When I drag a BUTTON into the app
  And I set groupable input "xpos" to "0"
  And I set groupable input "ypos" to "0"
  And I drag element "#design_button1" 50 horizontally and 50 vertically
  Then I see no difference for "dragging in app doesn't delete button" using stitch mode "none"

  When I drag element "#design_button1" 250 horizontally and 100 vertically
  Then I see no difference for "dragging slightly out of app leaves element partially out of bounds" using stitch mode "none"

  When I drag element "#design_button1" 100 horizontally and 100 vertically
  And I wait until element "#design_button1" is gone
  Then I see no difference for "dragging out of app deletes button" using stitch mode "none"

  And I close my eyes
