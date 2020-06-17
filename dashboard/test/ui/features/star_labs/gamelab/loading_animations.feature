@as_student
Feature: Game Lab Loading Animations

Scenario: Reload the project with a blank animation
  Given I start a new Game Lab project
  And I switch to the animation tab
  And I add a new, blank animation
  And I switch to the code tab in Game Lab
  And I press "runButton"

  Then I reload the page
  And I wait for the page to fully load
  And element ".modal-body" does not contain text "Sorry, we couldn't load animation"