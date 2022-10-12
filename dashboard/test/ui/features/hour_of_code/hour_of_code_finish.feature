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

Scenario: Flappy customized dashboard certificate pages
  Given I am on "http://studio.code.org/congrats"
  And I wait until element "#uitest-certificate" is visible

  When I am on "http://code.org/api/hour/finish/flappy"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  Then the href of selector ".social-print-link" contains "/print_certificates/"
  Then I wait to see an image "/images/hour_of_code_certificate.jpg"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  Then I wait to see an image "/certificate_images/"

  When I press the first "#uitest-certificate img" element to load a new page
  And I wait until current URL contains "/certificates/"
  Then I wait to see an image "/certificate_images/"

  When I press the first "#certificate-share img" element to load a new page
  And I wait until current URL contains "/print_certificates/"
  Then I wait to see an image "/certificate_images/"

Scenario: Oceans uncustomized dashboard certificate pages
  Given I am on "http://studio.code.org/congrats"
  And I wait until element "#uitest-certificate" is visible

  When I am on "http://code.org/api/hour/finish/oceans"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  Then the href of selector ".social-print-link" contains "/print_certificates/"
  And I wait to see an image "/images/oceans_hoc_certificate.png"

  When I press the first "#uitest-certificate img" element to load a new page
  And I wait until current URL contains "/certificates/"
  Then I wait to see an image "/images/oceans_hoc_certificate.png"

  When I press the first "#certificate-share img" element to load a new page
  And I wait until current URL contains "/print_certificates/"
  Then I wait to see an image "/images/oceans_hoc_certificate.png"

Scenario: Course A 2017 uncustomized dashboard certificate pages
  Given I am on "http://studio.code.org/congrats"
  And I wait until element "#uitest-certificate" is visible

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

Scenario: blank certificate
  When I am on "http://code.org/certificates/blank"
  # bypass replace_hostname logic, and match against a production url
  And I wait until current URL contains "studio.code.org/certificates/blank"
  Then I wait to see an image "/images/hour_of_code_certificate.jpg"

Scenario: pegasus congrats page redirects to dashboard congrats page
  When I am on "http://code.org/congrats"
  # bypass replace_hostname logic, and match against a production url
  And I wait until current URL contains "studio.code.org/congrats"
  And I wait to see element with ID "uitest-certificate"

@as_teacher
Scenario: pegasus batch page redirects to dashboard batch page
  When I am on "http://code.org/certificates"
  # bypass replace_hostname logic, and match against a production url
  And I wait until current URL contains "studio.code.org/certificates/batch"
  And I wait to see element with ID "certificate-batch"

Scenario: sharecertificate page redirects to blank certificate page
  When I am on "http://code.org/sharecertificate"
  # bypass replace_hostname logic, and match against a production url
  And I wait until current URL contains "studio.code.org/certificates/blank"
  And I wait to see element with ID "certificate-share"

@eyes
Scenario: congrats certificate pages
  Given I am on "http://studio.code.org/congrats"
  And I wait until element "#uitest-certificate" is visible
  And element "#uitest-certificate" is visible
  And I open my eyes to test "congrats certificate pages"

  When I am on "http://code.org/api/hour/finish/flappy"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I see no difference for "uncustomized flappy certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I see no difference for "customized flappy certificate"

  When I am on "http://code.org/api/hour/finish/oceans"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I see no difference for "uncustomized oceans certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I see no difference for "customized oceans certificate"

  When I am on "http://code.org/congrats/coursea-2017"
  And I wait until current URL contains "http://studio.code.org/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I see no difference for "uncustomized Course A 2017 certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I see no difference for "customized Course A 2017 certificate"

  When I am on "http://code.org/congrats/accelerated"
  And I wait until current URL contains "http://studio.code.org/congrats"
  And I wait to see element with ID "uitest-certificate"
  And element "#uitest-certificate" is visible
  And I wait for image "#uitest-certificate img" to load
  And I see no difference for "uncustomized 20-hour certificate"

  When I type "Robo Códer" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"
  And I see no difference for "customized 20-hour certificate"

  And I close my eyes
