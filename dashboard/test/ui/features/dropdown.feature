Feature: Dropdowns work as expected

Background:
  Given I am on "http://learn.code.org/flappy/1?noautoplay=true"

Scenario: Drag a dropdown and select a different option.
  When I rotate to landscape
  And I press "x-close"
  And I wait for 1 seconds
  And I drag the play sound block to offset "200, 100"
  And I press the dropdown
  Then the dropdown is visible
  Then I select the crash item from the dropdown
  Then the dropdown is hidden
  And the dropdown field has text "crash ▼"
