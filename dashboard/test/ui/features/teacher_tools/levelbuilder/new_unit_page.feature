@no_mobile
Feature: Using the New Unit Page

  Scenario: Create a new unit
    Given I create a levelbuilder named "Levi"
    And I am on "http://studio.code.org/s/new"
    And I wait until element ".isCourseSelector" is visible

    When I select the "Part of a course" option in dropdown with class "isCourseSelector"
    And I wait until element "input[name='script[name]']" is visible
    And I enter a temp unit name
    And I click "button[type='button']"
    And I wait until element ".submitDialog" is visible
    And I click "button[type='submit']" to load a new page

    Then I wait for the temp unit edit page to load
    And I click "button[type='submit']" to load a new page

    Then I wait for the temp unit overview page to load
    And I delete the temp unit
