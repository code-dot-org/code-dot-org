@eyes
Feature: Checking the footer appearance

  Scenario: Desktop puzzle small footer appearance
    Given I am on "http://learn.code.org/s/allthethings/stage/2/puzzle/1?noautoplay=true"
    And I close the dialog

    When I open my eyes to test "Desktop puzzle small footer appearance"
    Then I see no difference for "small footer"

    When I press the first ".more-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "footer menu"
    And I press the first ".more-link" element
    And I wait for 0.25 seconds

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "copyright flyout"
    And I press the first ".copyright-link" element
    And I wait for 0.25 seconds

    When I drag the grippy by -400 pixels
    Then I see no difference for "smaller small footer"
    And I wait for 0.25 seconds

    When I press the first ".more-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "smaller footer menu"
    And I press the first ".more-link" element
    And I wait for 0.25 seconds

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "smaller copyright flyout"

    Then I close my eyes

  Scenario: Desktop Star Wars share small footer appearance
    Given I am on "http://learn.code.org/s/starwars/stage/1/puzzle/15?noautoplay=true"
    And I close the dialog
    And I press "runButton"
    And I wait until element "#finishButton" is visible
    And I press "finishButton"
    And I wait until element "#sharing-input" is visible
    And I navigate to the share URL
    And I wait until element ".small-footer-base" is visible

    When I open my eyes to test "Desktop Star Wars share small footer appearance"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes

  @dashboard_db_access
  @as_student
  Scenario: Desktop Applab share small footer appearance
    Given I start a new Applab project
    And I navigate to the shared version of my project
    And I wait until element ".small-footer-base" is visible
    And I wait for 2 seconds

    When I open my eyes to test "Desktop Applab share small footer appearance"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes
