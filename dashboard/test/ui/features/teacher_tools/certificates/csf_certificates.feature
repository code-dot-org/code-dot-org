Feature: After completing a CSF course, the student is directed to a congratulations page

  Scenario: Course A 2017 uncustomized dashboard certificate pages
    Given I create a student named "Student1"
    And I sign in as "Student1"
    And I complete course "coursea-2017" unit 1
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
  Scenario: accelerated course certificates
    When I open my eyes to test "accelerated certificate pages"
    And I am on "http://code.org/congrats/accelerated"
    And I wait until current URL contains "http://studio.code.org/congrats"
    And I wait to see element with ID "uitest-certificate"
    And element "#uitest-certificate" is visible
    And I wait for image "#uitest-certificate img" to load
    And I wait until element ".fa-x-twitter" is visible
    And the href of selector ".social-print-link" contains "/print_certificates/"
    And I wait for 5 seconds
    Then I see no difference for "uncustomized 20-hour certificate"

    When I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"
    And I wait for 5 seconds
    And I see no difference for "customized 20-hour certificate"
    And I close my eyes

  @eyes
  Scenario: Course A certificate pages
    When I open my eyes to test "Course A certificate pages"
    And I create a student named "Student1"
    And I sign in as "Student1"
    And I complete course "coursea-2017" unit 1

    When I am on "http://code.org/congrats/coursea-2017"
    And I wait until current URL contains "http://studio.code.org/congrats"
    And I wait to see element with ID "uitest-certificate"
    And element "#uitest-certificate" is visible
    And I wait for image "#uitest-certificate img" to load
    And I wait until element ".fa-x-twitter" is visible
    And the href of selector ".social-print-link" contains "/print_certificates/"
    And I wait for 5 seconds
    And I see no difference for "uncustomized Course A 2017 certificate"

    When I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"
    And I wait for 5 seconds
    And I see no difference for "customized Course A 2017 certificate"

    And I close my eyes
