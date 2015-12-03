Feature: Checking the footer appearance

  @eyes
  Scenario: Desktop puzzle small footer appearance
    Given I am on "http://learn.code.org/s/allthethings/stage/2/puzzle/1?noautoplay=true"
    And I close the dialog

    When I open my eyes to test "Desktop puzzle small footer appearance"
    Then I see no difference for "small footer"

    When I open the small footer menu
    And I wait for 0.25 seconds
    Then I see no difference for "footer menu"
    And I close the small footer menu
    And I wait for 0.25 seconds

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "copyright flyout"
    And I press the first ".copyright-link" element
    And I wait for 0.25 seconds

    When I drag the grippy by -400 pixels
    Then I see no difference for "smaller small footer"
    And I wait for 0.25 seconds

    When I open the small footer menu
    And I wait for 0.25 seconds
    Then I see no difference for "smaller footer menu"
    And I close the small footer menu
    And I wait for 0.25 seconds

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "smaller copyright flyout"
    And I press the first ".copyright-link" element
    And I wait for 0.25 seconds

    # Now, variations where we resize while the flyouts are open, to make
    # sure they update their size/position properly during the resize
    When I open the small footer menu
    And I wait for 0.25 seconds
    Then I see no difference for "menu resize before"
    When I drag the grippy by 400 pixels
    Then I see no difference for "menu resize after"
    And I close the small footer menu
    And I wait for 0.25 seconds

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "copyright resize before"
    When I drag the grippy by -400 pixels
    Then I see no difference for "copyright resize after"

    Then I close my eyes

  @eyes
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

  # TODO: Check footer appearance in "How it Works" scenario

  @eyes @dashboard_db_access @as_student
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

  @eyes_mobile
  Scenario: Mobile Star Wars share small footer appearance
    Given I am on "http://learn.code.org/s/starwars/stage/1/puzzle/15?noautoplay=true"
    And I rotate to landscape
    And I close the dialog
    And I press "runButton"
    And I wait until element "#finishButton" is visible
    And I press "finishButton"
    And I wait until element "#sharing-input" is visible
    And I rotate to portrait
    And I wait for 0.5 seconds
    And I navigate to the share URL
    And I wait until element ".small-footer-base" is visible

    # We press the run button to clear the "Add to home screen" popup
    # We don't actually care about the running program (ignored in eyes test)
    # The timed delays give the popup time to fade out
    And I press "runButton"
    And I wait for 1.5 seconds
    And I press "resetButton"
    And I wait for 0.5 seconds

    When I open my eyes to test "Mobile Star Wars share small footer appearance"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes

  @eyes_mobile @dashboard_db_access @as_student
  Scenario: Mobile Applab share small footer appearance
    Given I rotate to landscape
    And I start a new Applab project
    And I navigate to the shared version of my project
    And I rotate to portrait
    And I wait until element ".small-footer-base" is visible

    When I open my eyes to test "Mobile Applab share small footer appearance"

    # This nonsense is to get the "Add to home screen" popup to fade out
    And I open the small footer menu
    And I wait for 2 seconds
    And I close the small footer menu
    And I wait for 2 seconds
    And I open the small footer menu
    And I wait for 2 seconds
    And I close the small footer menu
    And I wait for 2 seconds

    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes
