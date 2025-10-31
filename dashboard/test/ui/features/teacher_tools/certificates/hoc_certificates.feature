Feature: After completing the Hour of Code, the player is directed to a congratulations page

  Scenario: Completing Minecraft HoC should go to certificate page and generate a certificate
    Given I am on "http://studio.code.org/courses/mc/units/1/reset"
    Given I load the last Minecraft HoC level
    Then I wait until the Minecraft game is loaded
    And I press "runButton"
    Then I wait until element "#rightButton" is visible
    And I press "rightButton"
    Then I wait to see a congrats dialog with title containing "Keep Playing"
    And I press "#continue-button" using jQuery
    And I wait until current URL contains "/congrats"
    And my query params match "\?i\=.*\&s\=bWM\="
    And I wait to see element with ID "congrats-container"
    And I wait to see element with ID "uitest-certificate"
    And I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"

  @no_safari
  Scenario: non-mee 3rd party tutorial redirects to congrats page with params
    Given I am on "http://studio.code.org/congrats"
    And I wait until element "#uitest-certificate" is visible

    When I am on "http://code.org/api/hour/finish/kodable"
    And I wait until current URL contains "http://studio.code.org/congrats"
    Then my query params match "\?i\=.*\&s\=a29kYWJsZQ=="

    When I wait to see element with ID "uitest-certificate"
    And I type "Robo Coder" into "#name"
    And I press "button:contains(Submit)" using jQuery
    Then I wait to see element with ID "uitest-thanks"

  @eyes
  Scenario: flappy course certificates
    When I open my eyes to test "flappy certificates"
    And I am on "http://code.org/api/hour/finish/flappy"
    And I wait until current URL contains "/congrats"
    And I wait to see element with ID "uitest-certificate"
    And element "#uitest-certificate" is visible
    And I wait for image "#uitest-certificate img" to load
    And I wait until element ".fa-x-twitter" is visible
    And the href of selector ".social-print-link" contains "/print_certificates/"
    And I wait for 5 seconds
    Then I see no difference for "uncustomized flappy certificate"

    When I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"
    And I wait for 5 seconds
    And I see no difference for "customized flappy certificate"

    When I press the first "#uitest-certificate img" element to load a new page
    And I wait until current URL contains "/certificates/"
    Then I wait to see an image "/certificate_images/"

    When I press the first "#certificate-share img" element to load a new page
    And I wait until current URL contains "/print_certificates/"
    Then I wait to see an image "/certificate_images/"
    And I close my eyes

  @eyes
  Scenario: oceans course certificates
    When I open my eyes to test "oceans certificates"
    And I am on "http://code.org/api/hour/finish/oceans"
    And I wait until current URL contains "/congrats"
    And I wait to see element with ID "uitest-certificate"
    And element "#uitest-certificate" is visible
    And I wait for image "#uitest-certificate img" to load
    And I wait until element ".fa-x-twitter" is visible
    And the href of selector ".social-print-link" contains "/print_certificates/"
    And I wait for 5 seconds
    And I see no difference for "uncustomized oceans certificate"

    When I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"
    And I wait for 5 seconds
    And I see no difference for "customized oceans certificate"

    When I press the first "#uitest-certificate img" element to load a new page
    And I wait until current URL contains "/certificates/"
    And I see no difference for "oceans certificate page"

    When I press the first "#certificate-share img" element to load a new page
    And I wait until current URL contains "/print_certificates/"
  # This page doesn't render any icons, so we don't need to wait for Font Awesome to load.
    And I see no difference for "oceans print certificate page" without waiting for Font Awesome to load
    And I close my eyes
