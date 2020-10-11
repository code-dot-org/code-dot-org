@no_mobile
Feature: Using the Lesson Edit Page
  Scenario: Navigate from script edit page to lesson edit page
    Given I create a levelbuilder named "Levi"
    And I create a temp script and lesson
    And I view the temp script overview page
    And I view the temp script gui edit page

    # Open the lesson edit page
    And I click ".fa-pencil"
    And I switch tabs
    And I wait until element "#edit-container" is visible

    # Match the text 'Editing Lesson "Temp Lesson"'
    And element "h1" contains text "Editing Lesson"
    And element "h1" contains text "Temp Lesson"

    And I delete the temp script and lesson

  Scenario: View lesson edit page
    Given I create a levelbuilder named "Levi"
    And I create a temp script and lesson
    And I view the temp lesson edit page

    # Match the text 'Editing Lesson "Temp Lesson"'
    And element "h1" contains text "Editing Lesson"
    And element "h1" contains text "Temp Lesson"
