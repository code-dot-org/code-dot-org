Feature: Certificate page features

  Scenario: Pegasus share page preserves certificate when redirecting
  # Reset lesson data (otherwise it will pull a cached certificate from
  # other tests)
    Given I am on "http://studio.code.org/courses/mc/units/1/reset"
    And I wait for the lab page to fully load
    Then I wait until the Minecraft game is loaded

  # Set up a customized certificate
    Given I am on "http://code.org/api/hour/finish/mc"
    And I wait until current URL contains "/congrats"
    And I wait to see element with ID "uitest-certificate"
    And I type "Robo Coder" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"

  # Verify that the old certificate share url will redirect to the new one,
  # preserving the custom certificate image
    When I navigate to the pegasus certificate share page
    And I wait until current URL contains "http://studio.code.org/certificates"
    And I wait to see an image "/certificate_images/"
    And I see custom certificate image with name "Robo Coder" and course "mc"

  @no_mobile
  Scenario: certificate page with no course name
    Given I am on "http://studio.code.org/congrats"
    And I wait until element "#uitest-certificate" is visible
    And element "#uitest-certificate" is visible
    And I wait until element ".fa-facebook" is visible
    And I wait until element ".fa-x-twitter" is visible
    And the href of selector ".social-print-link" contains "/print_certificates/"

  @eyes
  Scenario: customized dashboard certificate pages with no course name
    When I open my eyes to test "customized certificates"
    Given I am on "http://studio.code.org/congrats"
    And I wait to see element with ID "uitest-certificate"
    Then the href of selector ".social-print-link" contains "/print_certificates/"
    And I wait for 5 seconds
    And I see no difference for "uncustomized congrats page"

    When I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"
    Then I wait to see an image "/certificate_images/"
    And I see no difference for "personalized congrats page"

    When I press the first "#uitest-certificate img" element to load a new page
    And I wait until current URL contains "/certificates/"
    Then I wait to see an image "/certificate_images/"
    And I see no difference for "certificate page"

    When I press the first "#certificate-share img" element to load a new page
    And I wait until current URL contains "/print_certificates/"
    Then I wait to see an image "/certificate_images/"
  # This page doesn't render any icons, so we don't need to wait for Font Awesome to load.
    And I see no difference for "print certificate page" without waiting for Font Awesome to load

    And I close my eyes
