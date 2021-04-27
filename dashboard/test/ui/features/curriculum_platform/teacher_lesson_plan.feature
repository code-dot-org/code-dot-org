@no_mobile
Feature: Teacher Lesson Plan

  Scenario: Viewing Teacher Lesson Plan
    Given I create a teacher named "Ms_Frizzle"
    And I am on "http://studio.code.org/s/allthemigratedthings/lessons/1"
    And I wait until element "#show-container" is visible

    # Check for Announcements
    Then I wait until element ".announcement-notification:first" is visible
    And element ".announcement-notification:first" contains text matching "Information for Teachers"

    Then I wait until element ".announcement-notification:nth(1)" is visible
    And element ".announcement-notification:nth(1)" contains text matching "Information for Students and Teachers"

    # Check for name of lesson
    And I wait until element "h1:contains(Lesson 1: First Lesson)" is visible

    # Check for Overview
    And I wait until element "h2:contains(Overview)" is visible
    And I wait until element "p:contains(Teacher overview of the lesson)" is visible

    # Check for Purpose
    And I wait until element "h2:contains(Purpose)" is visible
    And I wait until element "p:contains(Purpose of this lesson is learning)" is visible

    # Check for Assessment Opportunities
    And I wait until element "h2:contains(Assessment Opportunities)" is visible
    And I wait until element "p:contains(Assessment opportunities are everywhere)" is visible

    # Check for Objectives
    And I wait until element "h2:contains(Objectives)" is visible
    And I wait until element "li span:contains(Learn lots of stuff)" is visible

    # Check for Prep
    And I wait until element "h2:contains(Prep)" is visible
    And I wait until element "ul li:contains(Do this)" is visible

    # Check for Resources
    And I wait until element "h2:contains(Links)" is visible
    And I wait until element "li a:contains(Student Resource)" is visible

    # Check for Vocab
    And I wait until element "h2:contains(Vocabulary)" is visible
    And I wait until element "li:contains(Word - This is a definition of the word word)" is visible

    # Check for Code
    And I wait until element "h2:contains(Introduced Code)" is visible
    And I wait until element "li a:contains(playSound)" is visible

    # Check for Teaching Guide
    And I wait until element "h2:contains(Teaching Guide)" is visible
    And I wait until element "h2:contains(Activity 1)" is visible
    And I wait until element ".uitest-ProgressPill" is visible

    # Discussion goal is collapsible
    And I wait until element ".unit-test-tip-tab" is visible
    And I wait until element "p:contains(Get students to talk)" is visible
    And I click selector ".unit-test-tip-tab"
    And I wait until element "p:contains(Get students to talk)" is not visible

    # Level details appears after level bubble is clicked
    And I wait until element ".uitest-ProgressPill" is visible
    And I click selector ".uitest-ProgressPill"
    And I wait until element ".modal" is visible
    And I wait until element ".modal-body button:contains(Dismiss)" is visible
    And I click selector ".modal-body button:contains(Dismiss)"
    And I wait until element ".modal-backdrop" is gone

    # Navigate between lesson plans
    Then I wait until element ".uitest-lesson-dropdown-nav" is visible
    And I click ".uitest-lesson-dropdown-nav"
    Then I wait until element "a.no-navigation:nth(1)" is visible
    And I click selector "a.no-navigation:nth(1)"
    And I wait until element "a.navigate:contains(2 - Second Lesson)" is visible
    Then I wait until element "a.navigate:nth(0)" is visible
    And I click selector "a.navigate:nth(0)"
    Then I wait until I am on "http://studio.code.org/s/allthemigratedthings/lessons/2"
    And I wait until element "#show-container" is visible
    And I wait until element "h1:contains(Lesson 2: Second Lesson)" is visible

    # Navigate to the Unit page
    And I wait until element "a:contains(All the Migrated Things)" is visible
    And I click selector "a:contains(All the Migrated Things)"
    And I wait until I am on "http://studio.code.org/s/allthemigratedthings"
