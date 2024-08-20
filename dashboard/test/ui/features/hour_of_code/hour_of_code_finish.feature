@no_safari
Feature: After completing the Hour of Code, the player is directed to a congratulations page

Scenario: Completing Minecraft HoC should go to certificate page and generate a certificate
  Given I am on "http://studio.code.org/s/mc/reset"
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

@eyes
Scenario: Flappy customized dashboard certificate pages
  When I open my eyes to test "flappy certificates"
  Given I am on "http://studio.code.org/congrats"
  And I wait until element "#uitest-certificate" is visible

  When I am on "http://code.org/api/hour/finish/flappy"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  Then the href of selector ".social-print-link" contains "/print_certificates/"
  And I wait for 5 seconds
  And I see no difference for "flappy congrats page"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  Then I wait to see an image "/certificate_images/"
  And I wait for 5 seconds
  And I see no difference for "personalixed flappy congrats page"

  When I press the first "#uitest-certificate img" element to load a new page
  And I wait until current URL contains "/certificates/"
  Then I wait to see an image "/certificate_images/"

  When I press the first "#certificate-share img" element to load a new page
  And I wait until current URL contains "/print_certificates/"
  Then I wait to see an image "/certificate_images/"
  And I close my eyes

Scenario: Pegasus share page preserves certificate when redirecting
  # Reset lesson data (otherwise it will pull a cached certificate from
  # other tests)
  Given I am on "http://studio.code.org/s/mc/reset"
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
Scenario: Oceans uncustomized dashboard certificate pages
  When I open my eyes to test "oceans certificates"
  Given I am on "http://studio.code.org/congrats"
  And I wait until element "#uitest-certificate" is visible

  When I am on "http://code.org/api/hour/finish/oceans"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  Then the href of selector ".social-print-link" contains "/print_certificates/"
  And I wait for 5 seconds
  And I see no difference for "oceans congrats page"

  When I press the first "#uitest-certificate img" element to load a new page
  And I wait until current URL contains "/certificates/"
  And I see no difference for "oceans certificate page"

  When I press the first "#certificate-share img" element to load a new page
  And I wait until current URL contains "/print_certificates/"
  And I see no difference for "oceans print certificate page"

  And I close my eyes

Scenario: Course A 2017 uncustomized dashboard certificate pages
  Given I create a student named "Student1"
  And I sign in as "Student1"
  And I complete unit coursea-2017
  And I am on "http://studio.code.org/congrats"
  Then I wait until element "#uitest-certificate" is visible

  When I am on "http://code.org/congrats/coursea-2017"
  And I wait until current URL contains "http://studio.code.org/congrats"
  And I wait to see element with ID "uitest-certificate"
  Then the href of selector ".social-print-link" contains "/print_certificates/"
  And I wait to see an image "/certificate_images/"

  When I press the first "#uitest-certificate img" element to load a new page
  And I wait until current URL contains "/certificates/"
  Then I wait to see an image "/certificate_images/"

  When I press the first "#certificate-share img" element to load a new page
  And I wait until current URL contains "/print_certificates/"
  Then I wait to see an image "/certificate_images/"

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
  And I see no difference for "print certificate page"

  And I close my eyes

@eyes
Scenario: congrats certificate pages
  Given I am on "http://studio.code.org/congrats"
  And I wait until element "#uitest-certificate" is visible
  And element "#uitest-certificate" is visible
  And I wait until element ".fa-facebook" is visible
  And I wait until element ".fa-twitter" is visible
  And I wait for 5 seconds
  And I open my eyes to test "congrats certificate pages"

  When I am on "http://code.org/api/hour/finish/flappy"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I wait until element ".fa-facebook" is visible
  And I wait until element ".fa-twitter" is visible
  And I wait for 5 seconds
  And I see no difference for "uncustomized flappy certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I wait for 5 seconds
  And I see no difference for "customized flappy certificate"

  When I am on "http://code.org/api/hour/finish/oceans"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I wait until element ".fa-facebook" is visible
  And I wait until element ".fa-twitter" is visible
  And I wait for 5 seconds
  And I see no difference for "uncustomized oceans certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I wait for 5 seconds
  And I see no difference for "customized oceans certificate"

  When I am on "http://code.org/congrats/accelerated"
  And I wait until current URL contains "http://studio.code.org/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I wait until element ".fa-facebook" is visible
  And I wait until element ".fa-twitter" is visible
  And I wait for 5 seconds
  And I see no difference for "uncustomized 20-hour certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I wait for 5 seconds
  And I see no difference for "customized 20-hour certificate"

  Given I create a student named "Student1"
  And I sign in as "Student1"
  And I complete unit coursea-2017
  When I am on "http://code.org/congrats/coursea-2017"
  And I wait until current URL contains "http://studio.code.org/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I wait until element ".fa-facebook" is visible
  And I wait until element ".fa-twitter" is visible
  And I wait for 5 seconds
  And I see no difference for "uncustomized Course A 2017 certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I wait for 5 seconds
  And I see no difference for "customized Course A 2017 certificate"

  And I close my eyes
