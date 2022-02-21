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
  And I type "Robo Coder" into "#name"
  And I press "button:contains(Submit)" using jQuery
  And I wait to see element with ID "uitest-thanks"

Scenario: Flappy customized dashboard certificate pages
  Given I am on "http://studio.code.org/congrats?enableExperiments=studioCertificate"
  And I wait until element "#uitest-certificate" is visible

  When I am on "http://code.org/api/hour/finish/flappy"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  Then the href of selector ".social-print-link" contains "/print_certificates/"
  Then I wait to see an image "/assets/js/hour_of_code_certificate"

  When I type "Robo Coder" into "#name"
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
  Given I am on "http://studio.code.org/congrats?enableExperiments=studioCertificate"
  And I wait until element "#uitest-certificate" is visible

  When I am on "http://code.org/api/hour/finish/oceans"
  And I wait until current URL contains "/congrats"
  And I wait to see element with ID "uitest-certificate"
  Then the href of selector ".social-print-link" contains "/print_certificates/"
  And I wait to see an image "/assets/js/oceans_hoc_certificate"

  When I press the first "#uitest-certificate a" element to load a new page
  And I wait until current URL contains "/certificates/"
  Then I wait to see an image "/images/oceans_hoc_certificate.png"

  When I press the first "#certificate-share a" element to load a new page
  And I wait until current URL contains "/print_certificates/"
  Then I wait to see an image "/images/oceans_hoc_certificate.png"
