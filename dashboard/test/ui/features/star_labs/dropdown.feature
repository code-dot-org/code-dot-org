Feature: Dropdowns work as expected

Background:
  Given I am on "http://studio.code.org/s/sports/lessons/1/levels/5?noautoplay=true"

Scenario: Drag a dropdown and select a different option.
  When I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  And I drag block "4" to offset "250, 100"
  And I press dropdown number 11
  Then the dropdown is visible
  Then I select item 2 from the dropdown
  And I wait for 1 seconds
  Then the dropdown is hidden
  And the dropdown field has text "whistle ▼"
