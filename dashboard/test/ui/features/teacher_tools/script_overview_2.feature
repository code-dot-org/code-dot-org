# 2/13/23: Temporarily disabling in Safari because the 'When I switch tabs' step is failing after
# upgrading to Safari 14.
@no_safari
@no_mobile
Feature: Unit overview page 2
  Scenario: Unit overview contents
    Given I create a student named "Jean"
    And I am on "http://studio.code.org/s/allthethings"
    # make sure we are in summary view and the page has finished loading
    And I wait until element "td:contains(Maze)" is visible
    # verify name format in summary view
    And element "td:contains(2. Maze)" is visible

    And I click selector ".uitest-toggle-detail"
    And I wait until element "td:contains(Maze)" is not visible
    And I wait until element "span:contains(Maze)" is visible
    # verify name format in detail view
    And element "span:contains(Lesson 2: Maze)" is visible

    And I am on "http://studio.code.org/s/mc"
    And I wait until element "td:contains(Minecraft)" is visible
    # verify script name overrides lesson name when there is only one lesson
    And element "td:contains(1. Minecraft Hour of Code)" is visible

  Scenario: Unit overview end-of-lesson
    Given I create a student named "Jean"
    # On last level of the lesson
    And I am on "http://studio.code.org/s/csp3-2019/lessons/3/levels/1"
    And I click selector ".submitButton"
    And I wait until I am on "http://studio.code.org/s/csp3-2019"
    And I wait for jquery to load
    And I wait until element ".uitest-end-of-lesson-header:contains(You finished Lesson 3!)" is visible
    And I reload the page
    And  element ".uitest-end-of-lesson-header:contains(You finished Lesson 3!)" is not visible

  Scenario: Unit overview lesson plan
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Teacher_Blake"
    And I am on "http://studio.code.org/s/csp3-2019?no_redirect=true"
    And I click selector "#uitest-lesson-plan" once I see it
    When I switch tabs
    And I wait until current URL contains "curriculum.code.org/csp-19/unit3/1/"

  Scenario: Unit overview new lesson plan
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Teacher_Blake"
    And I am on "http://studio.code.org/s/allthemigratedthings?no_redirect=true"
    And I click selector "#uitest-lesson-plan" once I see it
    When I switch tabs
    And I wait until current URL contains "/s/allthemigratedthings/lessons/1"

  Scenario: Unit overview student resources as teacher
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Teacher_Blake"
    And I am on "http://studio.code.org/s/allthemigratedthings?no_redirect=true"
    And I click selector "#uitest-student-resources" once I see it
    When I switch tabs
    And I wait until current URL contains "s/allthemigratedthings/lessons/1/student"

  Scenario: Unit overview student resources as student
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Blake"
    And I am on "http://studio.code.org/s/allthemigratedthings?no_redirect=true"
    And I click selector ".ui-test-lesson-resources" once I see it
    When I switch tabs
    And I wait until current URL contains "s/allthemigratedthings/lessons/1/student"
