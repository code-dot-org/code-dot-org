@no_mobile
Feature: Using the V2 teacher dashboard local navigation
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

  Scenario: Modifying settings on the teacher dashboard
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access

    When I click selector "a:contains(Untitled Section)" once I see it to load a new page

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Settings')" once I see it
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "h1:contains('Edit Section Details')" is visible

    And I press the first "input[name='grades[]']" element

    And I click selector "button:contains(Middle School)" once I see it
    And I click selector "input[name='Interactive Animations and Games']" once I see it

    And I press backspace to clear element "#uitest-section-name-setup"
    And I press keys "Sally's Super Section" for element "#uitest-section-name-setup"

    And I press "button:contains(Save)" using jQuery

    And I wait until element "h6:contains(Icon Key)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible

    And I wait until element "#ui-test-skeleton-progress-column" is not visible

    Then element "#unit-selector-v2" contains text "Interactive Animations and Games ('24-'25)"
    Then element "#uitest-sidebar-section-dropdown" contains text "Sally's Super Section"
    Then element "#uitest-sidebar-section-dropdown" does not contain text "Untitled Section"
