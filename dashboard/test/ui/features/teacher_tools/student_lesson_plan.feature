@no_mobile
Feature: Student Lesson Plan

  Scenario: Viewing Student Lesson Plan
    Given I create a student named "Jean"
    And I am on "http://studio.code.org/s/allthemigratedthings?no_redirect=true"
    And I wait until element ".ui-test-lesson-resources" is visible
    And I click selector ".ui-test-lesson-resources"

    When I switch tabs
    Then I wait until I am on "http://studio.code.org/s/allthemigratedthings/lessons/1/student"
    And I wait until element "#show-container" is visible

    # Check for name of lesson
    And I wait until element "h1:contains(Lesson 1: First Lesson)" is visible

    # Check for Overview
    And I wait until element "h2:contains(Overview)" is visible
    And I wait until element "p:contains(Student overview of the lesson)" is visible

    # Check for resources
    And I wait until element "h2:contains(Resources)" is visible
    And I wait until element "li a:contains(Student Resource)" is visible

    # Check for Vocab
    And I wait until element "h2:contains(Vocabulary)" is visible
    And I wait until element "li:contains(Word - This is a definition of the word word)" is visible

    # Check for Code
    And I wait until element "h2:contains(Introduced Code)" is visible
    And I wait until element "li a:contains(playSound)" is visible

    # Check for Announcements
    Then I wait until element ".announcement-notification:first" is visible
    And element ".announcement-notification:first" contains text matching "Information for Students"

    Then I wait until element ".announcement-notification:nth(1)" is visible
    And element ".announcement-notification:nth(1)" contains text matching "Information for Students and Teachers"

    # Navigate between student lesson plans
    Then I wait until element ".uitest-lesson-dropdown-nav" is visible
    And I click ".uitest-lesson-dropdown-nav"
    Then I wait until element "a.no-navigation:nth(1)" is visible
    And I click selector "a.no-navigation:nth(1)"
    And I wait until element "a.navigate:contains(2 - Second Lesson)" is visible
    Then I wait until element "a.navigate:nth(0)" is visible
    And I click selector "a.navigate:nth(0)"
    Then I wait until I am on "http://studio.code.org/s/allthemigratedthings/lessons/2/student"
    And I wait until element "#show-container" is visible
    And I wait until element "h1:contains(Lesson 2: Second Lesson)" is visible

    # Navigate to the Unit page
    And I wait until element "a:contains(All the Migrated Things)" is visible
    And I click selector "a:contains(All the Migrated Things)"
    And I wait until I am on "http://studio.code.org/s/allthemigratedthings"
