@no_mobile
# Our minimum version of Safari does not support web workers
@no_safari
@eyes
Feature: Python Lab start mode eyes


Background:
  Given I create a levelbuilder named "Penelope"
  And I am on "http://studio.code.org/s/allthethings/lessons/50/levels/1"
  And I wait until element "#uitest-extra-links-button" is visible
  And I press "uitest-extra-links-button"
  Then I click selector "a:contains([s]tart)" to load a new page
  And I wait to see "#uitest-codebridge-run"

Scenario: Basic Start mode
  When I open my eyes to test "Python Lab start mode"
  And I see no difference for "basic start mode page"
  And I close my eyes
