Feature: Dropdowns work as expected

Background:
  Given I am on "http://studio.code.org/s/playlab/lessons/1/levels/8?noautoplay=true"

@no_mobile
Scenario: Drag a dropdown and select a different option.
  When I wait for the lab page to fully load
  And I dismiss the login reminder
  And I drag block "1" to offset "300, 250"
  And I press dropdown number 45
  Then the dropdown is visible
  Then I select item 1 from the dropdown
  And I wait for 1 seconds
  Then the dropdown is hidden
  And the dropdown field has text "remove ▼"
  
