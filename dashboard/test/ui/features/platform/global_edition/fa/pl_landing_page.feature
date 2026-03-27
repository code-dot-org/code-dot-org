@chrome
@no_mobile
Feature: Global Edition - Farsi MVP - Professional Learning landing page

  Background:
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: New teacher without PL history sees relevant content sections for Farsi MVP
    Given I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home

    When I visit Farsi version of Professional Learning Lending page
    Then I open my eyes to test "[Farsi MVP] New teacher Professional Learning page"
    And I see no difference for "Full page"
    And I close my eyes

  Scenario: Facilitator does not see Facilitator Center in Farsi MVP
    Given I am a facilitator with started and completed courses

    When I am on "http://studio.code.org/my-professional-learning"
    Then I wait until element "button#myPLTabs-tab-myFacilitatorCenter" is visible

    When I visit Farsi version of Professional Learning Lending page
    Then element "button#myPLTabs-tab-myFacilitatorCenter" is not visible

    And I delete the workshop

  Scenario: Universal Instructor sees Instructor Center in Farsi MVP
    Given I create a teacher named "PL Instructor"
    And I sign in as "PL Instructor" and go home
    And I get universal instructor access
    And I reload the page

    When I am on "http://studio.code.org/my-professional-learning"
    Then I wait until element "button#myPLTabs-tab-instructorCenter" is visible

    When I visit Farsi version of Professional Learning Lending page
    Then element "button#myPLTabs-tab-instructorCenter" is visible

  Scenario: Regional Partner does not see Regional Partner Center in Farsi MVP
    Given I am a program manager with a started course
    And I wait for 2 seconds

    When I am on "http://studio.code.org/my-professional-learning"
    Then I wait until element "button#myPLTabs-tab-RPCenter" is visible

    When I visit Farsi version of Professional Learning Lending page
    Then element "button#myPLTabs-tab-RPCenter" is not visible

    And I delete the workshop

  Scenario: Workshop Organizer does not see Workshop Organizer Tab in Farsi MVP
    Given I am an organizer with started and completed courses
    And I wait for 2 seconds

    When I am on "http://studio.code.org/my-professional-learning"
    And I wait until element "button#myPLTabs-tab-workshopOrganizerCenter" is visible

    When I visit Farsi version of Professional Learning Lending page
    Then element "button#myPLTabs-tab-workshopOrganizerCenter" is not visible

    And I delete the workshop

  Scenario: Teacher with Self-paced PL courses sees Continue course button in Farsi MVP
    Given I create a teacher named "Self-paced Teacher"
    And I sign in as "Self-paced Teacher" and go home
    And I start a self-paced PL course

    When I am on "http://studio.code.org/my-professional-learning"
    And I wait until element "a[href*='/courses/alltheselfpacedplthings/units/1']" is visible

    When I visit Farsi version of Professional Learning Lending page
    Then element "a[href*='/courses/alltheselfpacedplthings/units/1']" is visible
