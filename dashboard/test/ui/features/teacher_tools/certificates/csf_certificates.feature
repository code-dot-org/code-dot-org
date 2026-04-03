Feature: After completing a CSF course, the student is directed to a congratulations page

  Scenario: CSF uncustomized dashboard certificate pages
    Given I create a student named "Student1"
    And I sign in as "Student1"
    And I complete course "ui-test-csf" unit 1
    And I am on "http://studio.code.org/congrats"
    Then I wait until element "#uitest-certificate" is visible

    When I am on "http://studio.code.org/congrats/ui-test-csf"
    And I wait until current URL contains "http://studio.code.org/congrats?s=dWktdGVzdC1jc2Y%3D"
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
  Scenario: CSF certificate pages
    When I open my eyes to test "CSF certificate pages"
    And I create a student named "Student1"
    And I sign in as "Student1"
    And I complete course "ui-test-csf" unit 1

    When I am on "http://studio.code.org/congrats/ui-test-csf"
    And I wait until current URL contains "http://studio.code.org/congrats?s=dWktdGVzdC1jc2Y%3D"
    And I wait to see element with ID "uitest-certificate"
    And element "#uitest-certificate" is visible
    And I wait for image "#uitest-certificate img" to load
    And I wait until element ".fa-x-twitter" is visible
    And the href of selector ".social-print-link" contains "/print_certificates/"
    And I wait for 5 seconds
    And I see no difference for "uncustomized CSF certificate"

    When I type "Robo Códer" into "#name"
    And I press "button:contains(Submit)" using jQuery
    And I wait to see element with ID "uitest-thanks"
    And I wait for 5 seconds
    And I see no difference for "customized CSF certificate"

    And I close my eyes
