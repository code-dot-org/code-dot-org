Feature: After completing the Hour of Code, the player is directed to a congratulations page

# api/hour routes hit a stub implementation of contentful for ui-test-
# tutorials, so that they can run in CI without contentful access tokens.
# See dashboard/engines/hoc_legacy/lib/hoc_legacy/tutorials.rb

  Background:
    Given I am on "http://studio.code.org/reset_session"

  Scenario: Completing UI Test Artist HoC should go to certificate page and generate a certificate
    Given I am on "http://studio.code.org/api/hour/begin/ui-test-artist"
    And I am on "http://studio.code.org/courses/ui-test-artist/units/1/lessons/1/levels/10?noautoplay=true"
    And I wait for the lab page to fully load
    And I click selector "#runButton"
    And I click selector "button:contains(Finish)" once I see it
    And I click selector "#continue-button" once I see it
    And I wait until current URL contains "/congrats"
    And my query params match "\?i\=.*\&s\=dWktdGVzdC1hcnRpc3Q%3D$"
    And I wait to see element with ID "congrats-container"
    And I wait to see element with ID "uitest-certificate"
    And I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"

  @no_safari
  @contentful_key
  Scenario: non-mee 3rd party tutorial redirects to congrats page with params
    Given I am on "http://studio.code.org/congrats"
    And I wait until element "#uitest-certificate" is visible

    When I am on "http://studio.code.org/api/hour/finish/kodable"
    And I wait until current URL contains "http://studio.code.org/congrats"
    Then my query params match "\?i\=.*\&s\=a29kYWJsZQ%3D%3D$"

    When I wait to see element with ID "uitest-certificate"
    And I type "Robo Coder" into "#name"
    And I press "button:contains(Submit)" using jQuery
    Then I wait to see element with ID "uitest-thanks"

  @eyes
  @contentful_key
  Scenario: flappy course certificates
    When I open my eyes to test "flappy certificates"
    And I am on "http://studio.code.org/api/hour/finish/flappy"
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
    And I am on "http://studio.code.org/api/hour/finish/ui-test-oceans"
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
    # This page is a pure image certificate with no FA icons.
    And I see no difference for "oceans certificate page" without waiting for Font Awesome to load

    When I press the first "#certificate-share img" element to load a new page
    And I wait until current URL contains "/print_certificates/"
  # This page doesn't render any icons, so we don't need to wait for Font Awesome to load.
    And I see no difference for "oceans print certificate page" without waiting for Font Awesome to load
    And I close my eyes
