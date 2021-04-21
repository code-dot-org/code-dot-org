Feature: Checking the footer appearance

  @eyes
  Scenario: Desktop puzzle using light small footer
    Given I am on "http://studio.code.org/s/allthethings/lessons/2/levels/1?noautoplay=true"
    And I wait for the page to fully load

    When I open my eyes to test "Desktop puzzle using light small footer"
    Then I see no difference for "small footer"

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "copyright flyout"
    And I press the first ".copyright-link" element
    And I wait for 0.25 seconds

    When I drag the visualization grippy by -400 pixels
    Then I see no difference for "smaller small footer"
    And I wait for 0.25 seconds

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "smaller copyright flyout"
    And I press the first ".copyright-link" element
    And I wait for 0.25 seconds

    # Now, variations where we resize while the flyouts are open, to make
    # sure they update their size/position properly during the resize

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "copyright resize before"
    When I drag the visualization grippy by -400 pixels
    Then I see no difference for "copyright resize after"

    Then I close my eyes

  @eyes
  Scenario: Desktop Minecraft puzzle using dark small footer
    Given I am on "http://studio.code.org/s/mc/lessons/1/levels/14?noautoplay=true"
    And I wait for the page to fully load

    When I open my eyes to test "Desktop Minecraft puzzle using dark small footer"
    Then I see no difference for "small footer"

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "copyright flyout"

    Then I close my eyes

  @eyes
  Scenario: Desktop Star Wars share small footer
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/15?noautoplay=true"
    And I wait for the page to fully load
    And I press "runButton"
    And I wait until element "#finishButton" is visible
    And I press "finishButton"
    And I wait until element "#sharing-input" is visible
    And I navigate to the share URL
    And I wait until element ".small-footer-base" is visible

    When I open my eyes to test "Desktop Star Wars share small footer"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"
    And I wait for 0.25 seconds
    And I close the small footer menu

    # While we're at it, check the footer on the "How it Works" page
    When I select the "How it Works (View Code)" small footer item
    And I wait for 2 seconds
    And I wait until element "#runButton" is visible
    Then I see no difference for "how it works small footer"

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "how it works copyright flyout"

    Then I close my eyes

  # TODO: Fix and re-enable (find #sharing-input element)
  @eyes @skip
  Scenario: Desktop Minecraft share small footer
    Given I am on "http://studio.code.org/s/mc/lessons/1/levels/14?noautoplay=true"
    And I wait for the page to fully load
    And I press "runButton"
    And I wait until element "#sharing-input" is visible
    And I navigate to the share URL
    And I wait until element ".small-footer-base" is visible

    When I open my eyes to test "Desktop Minecraft share small footer"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"
    And I wait for 0.25 seconds
    And I close the small footer menu

    # While we're at it, check the footer on the "How it Works" page
    When I select the "How it Works (View Code)" small footer item
    And I wait for 2 seconds
    And I wait until element "#runButton" is visible
    Then I see no difference for "how it works small footer"

    When I open the small footer menu
    And I wait for 0.25 seconds
    Then I see no difference for "how it works footer menu"
    And I close the small footer menu
    And I wait for 0.25 seconds

    When I press the first ".copyright-link" element
    And I wait for 0.25 seconds
    Then I see no difference for "how it works copyright flyout"

    Then I close my eyes

  @eyes @as_student
  Scenario: Desktop Applab share small footer
    Given I start a new Applab project
    And I navigate to the shared version of my project
    And I wait until element ".small-footer-base" is visible
    And I wait for 2 seconds

    When I open my eyes to test "Desktop Applab share small footer"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes

  @eyes_mobile @skip
  Scenario: Mobile Star Wars share small footer
    Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/15?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I press "runButton"
    And I wait until element "#finishButton" is visible
    And I press "finishButton"
    And I wait until element "#sharing-input" is visible
    And I rotate to portrait
    And I wait for 0.5 seconds
    And I navigate to the share URL
    And I wait until element ".small-footer-base" is visible

    # Additional wait to let scroll position settle and possibly have the
    # pin-to-home-screen popup go away
    And I wait for 10 seconds

    When I open my eyes to test "Mobile Star Wars share small footer"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes

  # TODO: Fix and re-enable (find #sharing-input element)
  @eyes_mobile @skip
  Scenario: Mobile Minecraft share small footer
    Given I am on "http://studio.code.org/s/mc/lessons/1/levels/14?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I press "runButton"
    And I wait until element "#sharing-input" is visible
    And I rotate to portrait
    And I wait for 0.5 seconds
    And I navigate to the share URL
    And I wait until element ".small-footer-base" is visible

    # Additional wait to let scroll position settle and possibly have the
    # pin-to-home-screen popup go away
    And I wait for 10 seconds

    When I open my eyes to test "Mobile Minecraft share small footer"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes

  @eyes_mobile @as_student
  Scenario: Mobile Applab share small footer
    Given I am on "http://studio.code.org/home"
    And I rotate to landscape
    And I start a new Applab project
    And I navigate to the shared version of my project
    And I rotate to portrait
    And I wait until element ".small-footer-base" is visible

    # Additional wait to let scroll position settle and possibly have the
    # pin-to-home-screen popup go away
    And I wait for 20 seconds

    When I open my eyes to test "Mobile Applab share small footer"
    Then I see no difference for "small footer"

    When I open the small footer menu
    Then I see no difference for "footer menu"

    When I press menu item "Copyright"
    Then I see no difference for "copyright flyout"

    Then I close my eyes
