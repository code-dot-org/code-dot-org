@chrome
@no_mobile
@pegasus_content
Feature: Global Edition - Farsi MVP - Professional Learning landing page

  Background:
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: New teacher without PL history sees relevant content sections for Farsi MVP
    Given I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home

    When I am on "http://studio.code.org/global/fa/my-professional-learning"
    And I select the "English" option in dropdown "locale" to load a new page
    And I wait until element "h1:contains(Professional Learning)" is visible
    Then I see Farsi version of Professional Learning Lending page

    When I open my eyes to test "[Farsi MVP] New teacher Professional Learning page"
    And I see no difference for "Full page"
    Then I close my eyes

  Scenario: Facilitator does not see Facilitator Center in Farsi MVP
    Given I am a facilitator with started and completed courses

    When I am on "http://studio.code.org/my-professional-learning"
    Then I wait until element "button:contains(Facilitator Center)" is visible

    When I am on "http://studio.code.org/global/fa/my-professional-learning"
    And I select the "English" option in dropdown "locale" to load a new page
    And I wait until element "h1:contains(Professional Learning)" is visible
    Then I see Farsi version of Professional Learning Lending page
    And element "button:contains(Facilitator Center)" is not visible

    And I delete the workshop

  Scenario: Universal Instructor sees Instructor Center in Farsi MVP
    Given I create a teacher named "PL Instructor"
    And I sign in as "PL Instructor" and go home
    And I get universal instructor access
    And I reload the page

    When I am on "http://studio.code.org/my-professional-learning"
    Then I wait until element "button:contains(Instructor Center)" is visible

    When I am on "http://studio.code.org/global/fa/my-professional-learning"
    And I select the "English" option in dropdown "locale" to load a new page
    And I wait until element "h1:contains(Professional Learning)" is visible
    Then I see Farsi version of Professional Learning Lending page
    And element "button:contains(Instructor Center)" is visible

  Scenario: Regional Partner does not see Regional Partner Center in Farsi MVP
    Given I am a program manager with a started course
    And I wait for 2 seconds

    When I am on "http://studio.code.org/my-professional-learning"
    Then I wait until element "button:contains(Regional Partner Center)" is visible

    When I am on "http://studio.code.org/global/fa/my-professional-learning"
    And I select the "English" option in dropdown "locale" to load a new page
    And I wait until element "h1:contains(Professional Learning)" is visible
    Then I see Farsi version of Professional Learning Lending page
    And element "button:contains(Regional Partner Center)" is not visible

    And I delete the workshop

  Scenario: Workshop Organizer does not see Workshop Organizer Tab in Farsi MVP
    Given I am an organizer with started and completed courses
    And I wait for 2 seconds

    When I am on "http://studio.code.org/my-professional-learning"
    And I wait until element "button:contains(Workshop Organizer)" is visible

    When I am on "http://studio.code.org/global/fa/my-professional-learning"
    And I select the "English" option in dropdown "locale" to load a new page
    And I wait until element "h1:contains(Professional Learning)" is visible
    Then I see Farsi version of Professional Learning Lending page
    And element "button:contains(Workshop Organizer)" is not visible

    And I delete the workshop

  Scenario: Teacher with Self-paced PL courses sees Continue course button in Farsi MVP
    Given I create a teacher named "Self-paced Teacher"
    And I sign in as "Self-paced Teacher" and go home
    And I start a self-paced PL course

    When I am on "http://studio.code.org/my-professional-learning"
    And I wait until element "a:contains(Continue course)" is visible

    When I am on "http://studio.code.org/global/fa/my-professional-learning"
    And I select the "English" option in dropdown "locale" to load a new page
    And I wait until element "h1:contains(Professional Learning)" is visible
    Then I see Farsi version of Professional Learning Lending page
    And element "a:contains(Continue course)" is visible
